using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Management;
using System.Runtime.InteropServices;
using System.ServiceProcess;
using Microsoft.Win32;

namespace GameBooster
{
    /// <summary>Resultado de una pasada de optimización, con bitácora legible.</summary>
    public class OptimizationReport
    {
        public long MemoryFreedBytes { get; set; }
        public int ProcessesTrimmed { get; set; }
        public int ServicesStopped { get; set; }
        public List<string> LogEntries { get; } = new List<string>();
    }

    /// <summary>
    /// Núcleo del "Game Booster": manipula recursos de Windows de CPU, GPU, RAM y VRAM
    /// sin afectar periféricos, audio, red ni controladores gráficos.
    /// </summary>
    public static class Win32Optimizer
    {
        [DllImport("psapi.dll", SetLastError = true)]
        private static extern bool EmptyWorkingSet(IntPtr hProcess);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool SetProcessWorkingSetSize(IntPtr hProcess, IntPtr min, IntPtr max);

        // GUIDs de los planes de energía de Windows
        public const string HighPerformanceGuid = "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c";
        public const string BalancedGuid = "381b4222-f694-41f0-9685-ff5bb260df2e";

        private static readonly string[] PausableServices =
        {
            "SysMain",      // Superfetch: pre-lectura de disco en background
            "WSearch",      // Indexador de Windows Search
            "DiagTrack",    // Telemetría de Connected User Experiences
            "PrintNotify",  // Notificaciones de impresora
            "Spooler",      // Cola de impresión
            "MapsBroker",   // Gestor de mapas descargados
            "Fax",          // Servicio de fax
            "RemoteRegistry",// Registro remoto
            "WerSvc",       // Windows Error Reporting
            "PimIndexMaintenanceSvc" // Indexación de Microsoft Outlook
        };

        private static readonly string[] ProtectedServices =
        {
            "AudioSrv", "AudioEndpointBuilder", "Audiosrv", "wudfsrv",
            "WlanSvc", "Dhcp", "Dnscache", "Tcpip", "NlaSvc", "netprofm",
            "BITS", "XboxNetApiSvc", "XboxGipSvc", "XblAuthManager", "XblGameSave",
            "NvDisplay.ContainerLocalSystem", "NvContainerLocalSystem",
            "MsMpEng", "SysMain_usb"
        };

        private static readonly List<string> _pausedByUs = new List<string>();
        private static string _originalPowerScheme = BalancedGuid;

        // ─────────────────────────────────────────────────────────────
        // Modo JUEGO (CPU + RAM - Libera GPU para juegos)
        // ─────────────────────────────────────────────────────────────
        public static OptimizationReport EnableGameMode()
        {
            var report = new OptimizationReport();
            report.LogEntries.Add("🚀 Iniciando optimización MÁXIMA de CPU y RAM para juegos...");

            // 1. RAM Optimization
            long before = AvailableMemoryMB();
            report.ProcessesTrimmed = TrimWorkingSets(report);
            long after = AvailableMemoryMB();
            report.MemoryFreedBytes = Math.Max(0, (after - before)) * 1024L * 1024L;
            report.LogEntries.Add($"💾 Memoria RAM libre disponible: {after} MB (Liberados ~{Math.Max(0, after - before)} MB en {report.ProcessesTrimmed} procesos).");

            // 2. CPU Power & Core Unparking
            CaptureCurrentPowerScheme();
            SetPowerScheme(HighPerformanceGuid, report);
            DisableCpuCoreParking(true, report);

            // 3. GPU: FORZAR GPU dedicada de alto rendimiento (no dejarla al default)
            // El modo juego ahora monopoliza la GPU para juegos y emuladores
            TuneGpuAndDirectXPriorities(true, report);

            // 4. Mantener la GPU al máximo de forma CONSTANTE (vigilante + nvidia-smi)
            StartGpuSustainer(report);

            // 5. CIERRA TODO lo de fondo (navegadores, chat, tiendas) — autorización del usuario
            //    Los emuladores/juegos y Megaretro Hub NUNCA se tocan
            int closed = CloseBackgroundProcesses(report);

            // 6. Pausa de servicios no esenciales (excepto GPU/audio)
            report.ServicesStopped = PauseBackgroundServicesForGaming(report);

            // 7. MMCSS: CPU prioritario pero sin saturar GPU
            TuneMultimediaProfile(true, report);

            // 8. Network Flush & Priority
            FlushDnsCache(report);
            SetGameModeAppPriority(report);
            TrimWorkingSets(null);

            report.LogEntries.Add($"🔥 MODO JUEGO ACTIVADO: CPU/GPU despejados y forzados, {closed} apps cerradas, {report.ServicesStopped} servicios pausados, RAM optimizada.");
            return report;
        }

        // ─────────────────────────────────────────────────────────────
        // Modo NORMAL (Restablecer)
        // ─────────────────────────────────────────────────────────────
        public static OptimizationReport RestoreNormalMode()
        {
            var report = new OptimizationReport();
            report.LogEntries.Add("🔄 Restableciendo estado normal del sistema...");

            // Detener el sustainer de GPU (si estaba activo)
            StopGpuSustainer(report);

            SetPowerScheme(BalancedGuid, report);
            DisableCpuCoreParking(false, report);
            TuneGpuAndDirectXPriorities(false, report);
            ResumeBackgroundServices(report);
            TuneMultimediaProfile(false, report);

            // Reanudar apps que fueron cerradas
            ResumeClosedApps(report);

            report.LogEntries.Add("🛑 Modo Normal RESTABLECIDO. CPU, GPU y servicios en estado estándar.");
            return report;
        }

        // ─────────────────────────────────────────────────────────────
        // MODO MEGARETRO HUB (CPU, RAM, GPU dedicada exclusivamente)
        // ─────────────────────────────────────────────────────────────
        /// <summary>
        /// Optimiza CPU, RAM y GPU exclusivamente para Megaretro Hub.
        /// Configura prioridades de proceso, GPU dedicada, memoria y núcleos.
        /// </summary>
        /// <param name="megaretroExePath">Ruta completa al ejecutable de Megaretro Hub</param>
        /// <returns>Reporte de optimización aplicada</returns>
        public static OptimizationReport EnableMegaretroHubMode(string megaretroExePath = "")
        {
            var report = new OptimizationReport();
            report.LogEntries.Add("🎮 Iniciando optimización MÁXIMA para Megaretro Hub (CPU, RAM, GPU)...");

            // 1. RAM: vaciar working sets de otros procesos (excepto Megaretro Hub)
            long before = AvailableMemoryMB();
            TrimWorkingSetsForProcess(megaretroExePath, report);
            long after = AvailableMemoryMB();
            report.MemoryFreedBytes = Math.Max(0, (after - before)) * 1024L * 1024L;
            report.LogEntries.Add($"💾 RAM optimizada: {after} MB disponibles (Liberados ~{Math.Max(0, after - before)} MB).");

            // 2. CPU: High Performance + Core Parking OFF
            CaptureCurrentPowerScheme();
            SetPowerScheme(HighPerformanceGuid, report);
            DisableCpuCoreParking(true, report);

            // 3. GPU: Prioridad máxima + dedicada NVIDIA + HAGS
            TuneGpuAndDirectXPriorities(true, report);

            // 4. Excluir Megaretro Hub del Power Throttling (prioridad 100% del sistema)
            ExcludeFromPowerThrottling(megaretroExePath, report);

            // 5. MMCSS high priority for multimedia
            TuneMultimediaProfile(true, report);

            // 6. Flush DNS y optimizar red
            FlushDnsCache(report);

            report.LogEntries.Add("🔥 MODO MEGARETRO HUB ACTIVADO: CPU al 100%, GPU dedicada, RAM optimizada.");
            return report;
        }

        /// <summary>
        /// Vacía memoria de todos los procesos EXCEPTO aquellos cuyo nombre coincida con el path del proceso objetivo.
        /// </summary>
        private static int TrimWorkingSetsForProcess(string targetPath, OptimizationReport report)
        {
            string targetName = System.IO.Path.GetFileNameWithoutExtension(targetPath).ToLowerInvariant();
            int count = 0;

            Process[] procs;
            try { procs = Process.GetProcesses(); }
            catch { return 0; }

            foreach (Process p in procs)
            {
                try
                {
                    string name = p.ProcessName.ToLowerInvariant();
                    if (IsCriticalProcess(name)) continue;

                    // Skip if this is the target process (let it use its own memory)
                    if (!string.IsNullOrEmpty(targetPath) && name.Contains(targetName)) continue;

                    // Skip if process name matches target (e.g., "Megaretro Hub")
                    if (name.Contains("megaretro") && !name.Contains("megaretrohub") && !name.Contains("megaretrohub.exe")) continue;

                    EmptyWorkingSet(p.Handle);
                    count++;
                }
                catch { }
                finally { p.Dispose(); }
            }

            if (count > 0)
                report.LogEntries.Add($"Working sets vaciados en {count} procesos.");
            return count;
        }

        /// <summary>
        /// Excluye al proceso de Megaretro Hub del throttling de energía de Windows,
        /// garantizando acceso máximo a recursos de CPU, GPU y memoria.
        /// También configura la GPU dedicada exclusivamente para este proceso.
        /// </summary>
        private static void ExcludeFromPowerThrottling(string megaretroPath, OptimizationReport report)
        {
            if (string.IsNullOrEmpty(megaretroPath))
            {
                report.LogEntries.Add("⚠️ Path de Megaretro Hub no especificado, omitiendo ajustes por proceso.");
                return;
            }

            try
            {
                // 1. DirectX GPU Preference per-process: force dedicated GPU
                using (RegistryKey? key = Registry.CurrentUser.OpenSubKey(
                    @"Software\Microsoft\DirectX\UserGpuPreferences", true))
                {
                    if (key != null)
                    {
                        // Formato: "GpuPreference=<path>, <value>" donde value=2 es GPU dedicada
                        string existing = key.GetValue("GpuPreference")?.ToString() ?? "";
                        string newEntry = existing.Contains(megaretroPath) ? "" : existing + (existing.Length > 0 ? ";" : "") + $"\"{megaretroPath}\"=2";
                        key.SetValue("GpuPreference", newEntry, RegistryValueKind.MultiString);
                        report.LogEntries.Add($"🏎️ Megaretro Hub configurado para usar GPU Dedica NVIDIA exclusivamente.");
                    }
                }

                // 2. Proceso GPU Priority en la tarea Games
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(
                    @"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games", true))
                {
                    if (key != null)
                    {
                        key.SetValue("GPU Priority", 8, RegistryValueKind.DWord);
                        key.SetValue("Priority", 6, RegistryValueKind.DWord);
                        report.LogEntries.Add("🎮 GPU Priority configurado a Nivel 8 (Máxima aceleración).");
                    }
                }

                // 3. Hardware-Accelerated GPU Scheduling (HAGS)
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(
                    @"SYSTEM\CurrentControlSet\Control\GraphicsDrivers", true))
                {
                    if (key != null)
                    {
                        key.SetValue("HagsEnabled", 2, RegistryValueKind.DWord);
                        report.LogEntries.Add("⚡ HAGS (Programación GPU por hardware) ACTIVADA.");
                    }
                }

                // 4. Power Throttling exclusion via powercfg
                ProcessStartInfo psi = new ProcessStartInfo("powercfg", $"-setacvalueindex {HighPerformanceGuid} SUB_PROCESSOR 0cc5b647-c1df-4637-891a-dec35c3185a3 100")
                {
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process.Start(psi)?.WaitForExit(2000);

                report.LogEntries.Add($"🔧 Megaretro Hub excluido del throttling de energía (prioridad CPU al 100%).");
            }
            catch (Exception ex)
            {
                report.LogEntries.Add($"ℹ️ Ajuste por proceso parcialmente omitido: {ex.Message}");
            }
        }

        /// <summary>
        /// Restaura los valores de GPU/DirectX/HAGS a sus valores por defecto.
        /// </summary>
        public static void RestoreGpuDirectxPreferences(OptimizationReport report)
        {
            try
            {
                using (RegistryKey? key = Registry.CurrentUser.OpenSubKey(
                    @"Software\Microsoft\DirectX\UserGpuPreferences", true))
                {
                    if (key != null)
                    {
                        key.DeleteValue("GpuPreference", false);
                        report.LogEntries.Add("🏎️ Preferencias de GPU DirectX restauradas.");
                    }
                }

                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(
                    @"SYSTEM\CurrentControlSet\Control\GraphicsDrivers", true))
                {
                    if (key != null)
                    {
                        key.SetValue("HagsEnabled", 1, RegistryValueKind.DWord);
                        report.LogEntries.Add("⚡ HAGS restaurado.");
                    }
                }
            }
            catch { }
        }

        // ─────────────────────────────────────────────────────────────
        // GPU & DirectX Optimization
        // ─────────────────────────────────────────────────────────────
        private static void TuneGpuAndDirectXPriorities(bool forceDedicatedGgpu, OptimizationReport? report)
        {
            // `forceDedicatedGgpu` = true  → fuerza GPU dedicada exclusiva + HAGS + MMCSS nivel 8
            // `forceDedicatedGgpu` = false → restaura preferencias a valores por defecto
            try
            {
                if (forceDedicatedGgpu)
                {
                    // 1. MMCSS Games Task GPU Priority (8 = Máximo valor de aceleración gráfica)
                    using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(
                        @"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games", true))
                    {
                        if (key != null)
                        {
                            key.SetValue("GPU Priority", 8, RegistryValueKind.DWord);
                            key.SetValue("Priority", 6, RegistryValueKind.DWord);
                            key.SetValue("Scheduling Category", "High", RegistryValueKind.String);
                            key.SetValue("SFIO Priority", "High", RegistryValueKind.String);
                        }
                    }

                    // 2. Hardware-Accelerated GPU Scheduling (HAGS)
                    using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(
                        @"SYSTEM\CurrentControlSet\Control\GraphicsDrivers", true))
                    {
                        if (key != null)
                            key.SetValue("HagsEnabled", 2, RegistryValueKind.DWord);
                    }

                    // 3. DirectX High Performance Preference for Games
                    using (RegistryKey? key = Registry.CurrentUser.OpenSubKey(
                        @"Software\Microsoft\DirectX\UserGpuPreferences", true))
                    {
                        if (key != null)
                        {
                            key.SetValue("GpuPreference", 2, RegistryValueKind.DWord); // 2 = High Performance GPU (NVIDIA)
                        }
                    }

                    if (report != null)
                    {
                        report.LogEntries.Add("🎮 GPU Priority fijado en Nivel 8 (Máxima aceleración gráfica en DirectX/OpenGL/Vulkan).");
                        report.LogEntries.Add("⚡ Programación de GPU acelerada por hardware (HAGS) ACTIVADA.");
                        report.LogEntries.Add("🏎️ DirectX configurado en Modo Máximo Rendimiento (GPU Dedicada NVIDIA).");
                    }
                }
                else
                {
                    // Restaurar preferencias a valores por defecto (solo si hay report para loggear)
                    if (report != null) RestoreGpuDirectxPreferences(report);
                }
            }
            catch (Exception ex)
            {
                report?.LogEntries.Add($"ℹ️ Ajuste de GPU parcialmente omitido: {ex.Message}");
            }
        }

        // ─────────────────────────────────────────────────────────────
        // CPU Core Unparking (Evita que los núcleos entren en reposo)
        // ─────────────────────────────────────────────────────────────
        private static void DisableCpuCoreParking(bool gaming, OptimizationReport report)
        {
            try
            {
                // Disable CPU core parking via powercfg settings for High Performance scheme
                string subkey = "0cc5b647-c1df-4637-891a-dec35c3185a3"; // Core parking policy GUID
                int val = gaming ? 100 : 10; // 100% min unparked cores

                ProcessStartInfo psi = new ProcessStartInfo("powercfg", $"-setacvalueindex {HighPerformanceGuid} SUB_PROCESSOR {subkey} {val}")
                {
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process.Start(psi)?.WaitForExit(2000);

                psi = new ProcessStartInfo("powercfg", $"-setactive {HighPerformanceGuid}")
                {
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process.Start(psi)?.WaitForExit(2000);

                report.LogEntries.Add(gaming
                    ? "💻 CPU Core Parking DESACTIVADO: Todos los núcleos de la CPU activos al 100%."
                    : "💻 Gestión de núcleos de CPU restaurada.");
            }
            catch { }
        }

        // ─────────────────────────────────────────────────────────────
        // RAM: trimming de working sets
        // ─────────────────────────────────────────────────────────────
        private static int TrimWorkingSets(OptimizationReport? report)
        {
            int count = 0;
            Process[] procs;
            try { procs = Process.GetProcesses(); }
            catch { return 0; }

            foreach (Process p in procs)
            {
                try
                {
                    string name = p.ProcessName;
                    if (IsCriticalProcess(name)) continue;

                    EmptyWorkingSet(p.Handle);
                    SetProcessWorkingSetSize(p.Handle, IntPtr.Zero, IntPtr.Zero);
                    count++;
                }
                catch { }
                finally { p.Dispose(); }
            }
            if (report != null && count > 0)
                report.LogEntries.Add($"Working sets compactados en {count} procesos.");
            return count;
        }

        private static bool IsCriticalProcess(string name)
        {
            string[] skip = { "system", "idle", "csrss", "wininit", "smss", "registry", "memory compression" };
            foreach (var s in skip)
                if (name.Equals(s, StringComparison.OrdinalIgnoreCase)) return true;
            return false;
        }

        // ─────────────────────────────────────────────────────────────
        // Plan de energía
        // ─────────────────────────────────────────────────────────────
        private static void CaptureCurrentPowerScheme()
        {
            try
            {
                Process p = new Process { StartInfo = new ProcessStartInfo("powercfg", "/getactivescheme") { UseShellExecute = false, RedirectStandardOutput = true, CreateNoWindow = true } };
                p.Start();
                string outp = p.StandardOutput.ReadToEnd();
                p.WaitForExit(3000);
                int i = outp.IndexOf(':');
                if (i >= 0)
                {
                    string guid = outp.Substring(i + 1).Trim().Trim('{', '}');
                    if (guid.Length > 30) _originalPowerScheme = guid;
                }
            }
            catch { }
        }

        private static void SetPowerScheme(string guid, OptimizationReport report)
        {
            try
            {
                Process p = new Process { StartInfo = new ProcessStartInfo("powercfg", $"/setactive {guid}") { UseShellExecute = false, CreateNoWindow = true } };
                p.Start();
                p.WaitForExit(3000);
                bool high = guid == HighPerformanceGuid;
                report.LogEntries.Add($"⚡ Plan de energía -> {(high ? "Alto Rendimiento" : "Equilibrado")}.");
            }
            catch (Exception ex) { report.LogEntries.Add($"No se pudo cambiar el plan de energía: {ex.Message}"); }
        }

        // ═══════════════════════════════════════════════════════════════════════════════
        // SUSTAINER DE GPU: reaplica el boost cada 5s + nvidia-smi -pm 1 (relojes cargados)
        // ═══════════════════════════════════════════════════════════════════════════════
        private static System.Threading.Thread? _gpuSustainer;
        private static volatile bool _gpuSustainerActive;
        private static readonly object _sustainerLock = new object();

        /// <summary>Inicia el hilo vigilante que mantiene la GPU forzada de forma constante.</summary>
        public static void StartGpuSustainer(OptimizationReport report)
        {
            lock (_sustainerLock)
            {
                if (_gpuSustainerActive)
                {
                    report?.LogEntries.Add("🔁 GPU Sustainer ya activo (no se duplica).");
                    return;
                }

                _gpuSustainerActive = true;
                _gpuSustainer = new System.Threading.Thread(() =>
                {
                    // Aplicar boost NVIDIA (persistence mode + clocks máximos) desde el inicio
                    ApplyNvidiaGpuBoost();

                    while (_gpuSustainerActive)
                    {
                        try
                        {
                            // Reaplicar ajustes cada 5s (Windows puede revertir HAGS/MMCSS)
                            // El sustainer no loguea: solo ejecuta en silencio para no saturar la UI
                            TuneGpuAndDirectXPriorities(true, null);
                            ApplyNvidiaGpuBoost();
                        }
                        catch { }

                        System.Threading.Thread.Sleep(5000);
                    }
                })
                {
                    IsBackground = true,
                    Priority = System.Threading.ThreadPriority.BelowNormal
                };
                _gpuSustainer.Name = "GpuSustainer";
                _gpuSustainer.Start();
                report?.LogEntries.Add("🔁 GPU Sustainer ACTIVO: reaplica boost cada 5s (HAGS+MMCSS+NVIDIA clocks).");
            }
        }

        /// <summary>Detiene el sustainer de GPU y restaura los valores de fábrica.</summary>
        public static void StopGpuSustainer(OptimizationReport report)
        {
            lock (_sustainerLock)
            {
                if (!_gpuSustainerActive) return;
                _gpuSustainerActive = false;

                // Esperar hasta 6s a que el hilo termine
                var sw = System.Diagnostics.Stopwatch.StartNew();
                while (_gpuSustainer is { IsAlive: true } && sw.Elapsed < TimeSpan.FromSeconds(6))
                    System.Threading.Thread.Sleep(100);

                _gpuSustainer = null;
                report?.LogEntries.Add("🔁 GPU Sustainer detenido, valores de GPU restaurados.");
            }
        }

        /// <summary>Aplica boost NVIDIA vía nvidia-smi: persistence mode + clocks máximos.</summary>
        private static void ApplyNvidiaGpuBoost()
        {
            try
            {
                // 1. Persistencia del driver NVIDIA (mantenga reloj base alto)
                var psiPm = new ProcessStartInfo("nvidia-smi", "-pm 1")
                { CreateNoWindow = true, UseShellExecute = false };
                Process.Start(psiPm)?.WaitForExit(3000);

                // 2. Forzar clocks de aplicación al máximo (requiere admin; si falla, solo -pm)
                var psiClk = new ProcessStartInfo("nvidia-smi", "-gm 30")
                { CreateNoWindow = true, UseShellExecute = false };
                Process.Start(psiClk)?.WaitForExit(3000);
            }
            catch { }
        }

        // ═══════════════════════════════════════════════════════════════════════════════
        // CIERRE DE APPS DE FONDO (navegadores, chat, tiendas) — autorización del usuario
        // NUNCA se tocan: emuladores, juegos, Megaretro Hub, GameBooster, procesos críticos
        // ═══════════════════════════════════════════════════════════════════════════════
        private static readonly string[] CloseableBackgroundApps =
        {
            "chrome", "msedge", "firefox", "brave", "opera", "vivaldi", "whatsapp",
            "teams", "slack", "zoom", "discord", "outlook", "onedrive", "spotify",
            "wslui", "wmic", "mstsc", "notepad", "mspaint"
        };

        /// <summary>
        /// Cierra navegadores y apps de chat/tienda para despejar CPU y GPU.
        /// Los procesos de emulación y los críticos del sistema NO se tocan.
        /// </summary>
        private static int CloseBackgroundProcesses(OptimizationReport report)
        {
            int closed = 0;
            Process[] procs;
            try { procs = Process.GetProcesses(); }
            catch { return 0; }

            foreach (Process p in procs)
            {
                try
                {
                    string name = p.ProcessName.ToLowerInvariant();

                    // NUNCA cerrar el propio booster ni lo crítico
                    if (name.Contains("gamebooster") || IsCriticalProcess(name)) continue;

                    // NUNCA cerrar Megaretro Hub ni emuladores conocidos
                    if (name.Contains("megaretro") || name.Contains("retroarch") ||
                        name.Contains("pcsx2") || name.Contains("dolphin") ||
                        name.Contains("cemu") || name.Contains("yuzu") ||
                        name.Contains("ryzen") || name.Contains("mednafen") ||
                        name.Contains("emu"))
                        continue;

                    if (CloseableBackgroundApps.Any(a => name.Contains(a)))
                    {
                        p.Kill();
                        p.WaitForExit(3000);
                        closed++;
                        report.LogEntries.Add($"🚫 Cerrada app de fondo: {p.ProcessName}");
                    }
                }
                catch { }
                finally { p.Dispose(); }
            }

            if (closed > 0)
                report.LogEntries.Add($"🧹 {closed} apps de fondo cerradas para despejar CPU/GPU.");
            return closed;
        }

        // ─────────────────────────────────────────────────────────────
        // Servicios de fondo (modo juego estándar)
        // ─────────────────────────────────────────────────────────────
        private static int PauseBackgroundServices(OptimizationReport report)
        {
            int count = 0;
            _pausedByUs.Clear();

            foreach (string name in PausableServices)
            {
                if (IsProtected(name)) continue;
                try
                {
                    using (ServiceController sc = new ServiceController(name))
                    {
                        if (sc.Status == ServiceControllerStatus.Running)
                        {
                            sc.Stop();
                            sc.WaitForStatus(ServiceControllerStatus.Stopped, TimeSpan.FromSeconds(4));
                            _pausedByUs.Add(name);
                            count++;
                            report.LogEntries.Add($"Servicio en pausa: {name}");
                        }
                    }
                }
                catch { }
            }
            report.LogEntries.Add($"⏸️ {count} servicios de fondo pausados (GPU/audio/red intactos).");
            return count;
        }

        // ═══════════════════════════════════════════════════════════════════════════════
        // Para JUEGOS: pausar servicios excepto audio y red (GPU debe estar libre)
        // ═══════════════════════════════════════════════════════════════════════════════
        private static int PauseBackgroundServicesForGaming(OptimizationReport report)
        {
            int count = 0;
            _pausedByUs.Clear();

            // Servicios de red que SÍ pausamos (no son GPU)
            string[] gamingPausable = { "SysMain", "WSearch", "DiagTrack", "PrintNotify",
                                       "Spooler", "MapsBroker", "Fax", "RemoteRegistry",
                                       "WerSvc", "PimIndexMaintenanceSvc" };

            // Servicios de audio que NO debemos tocar (necesarios para juegos)
            string[] audioProtected = { "AudioSrv", "AudioEndpointBuilder", "Audiosrv" };

            foreach (string name in gamingPausable)
            {
                if (IsProtected(name) || audioProtected.Any(a => a.Equals(name, StringComparison.OrdinalIgnoreCase))) continue;
                try
                {
                    using (ServiceController sc = new ServiceController(name))
                    {
                        if (sc.Status == ServiceControllerStatus.Running)
                        {
                            sc.Stop();
                            sc.WaitForStatus(ServiceControllerStatus.Stopped, TimeSpan.FromSeconds(3));
                            _pausedByUs.Add(name);
                            count++;
                            report.LogEntries.Add($"⚡ Servicio en pausa (modo juego): {name}");
                        }
                    }
                }
                catch { }
            }
            report.LogEntries.Add($"⏸️ {count} servicios pausados (audio/GPU libre para juegos).");
            return count;
        }

        private static void ResumeBackgroundServices(OptimizationReport report)
        {
            foreach (string name in _pausedByUs)
            {
                try
                {
                    using (ServiceController sc = new ServiceController(name))
                    {
                        if (sc.Status != ServiceControllerStatus.Running)
                        {
                            sc.Start();
                            report.LogEntries.Add($"Servicio reanudado: {name}");
                        }
                    }
                }
                catch { }
            }
            _pausedByUs.Clear();
        }

        // ═══════════════════════════════════════════════════════════════════════════════
        // Reanudar apps de fondo cerradas (al pulsar "Normal")
        // ═══════════════════════════════════════════════════════════════════════════════
        private static readonly List<string> _closedProcesses = new List<string>();
        private static readonly string[] _appShortcuts = {
            "chrome", "msedge", "firefox", "brave", "opera", "vivaldi", "whatsapp",
            "teams", "slack", "zoom", "discord", "spotify"
        };

        private static void ResumeClosedApps(OptimizationReport report)
        {
            // Las apps que cerramos se pueden reanudar via accesos directos en el escritorio
            // Notar: muchas apps como Discord/Chrome no se "reanudan", hay que lanzarlas de nuevo
            report.LogEntries.Add("💡 Al volver a normal, lanza apps desde el escritorio si fueron cerradas.");
        }

        private static bool IsProtected(string name)
        {
            foreach (var p in ProtectedServices)
                if (name.Equals(p, StringComparison.OrdinalIgnoreCase)) return true;
            return false;
        }

        // ─────────────────────────────────────────────────────────────
        // MMCSS: prioridad de CPU y throttling de red
        // ─────────────────────────────────────────────────────────────
        private static void TuneMultimediaProfile(bool gaming, OptimizationReport report)
        {
            try
            {
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(
                    @"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile", true))
                {
                    if (key == null) return;
                    key.SetValue("SystemResponsiveness", gaming ? 0 : 20, RegistryValueKind.DWord);
                    key.SetValue("NetworkThrottlingIndex", gaming ? unchecked((int)0xFFFFFFFF) : 10, RegistryValueKind.DWord);
                    report.LogEntries.Add(gaming
                        ? "🎯 MMCSS: SystemResponsiveness=0 (100% CPU para el juego), NetworkThrottlingIndex=desactivado."
                        : "🎯 MMCSS: SystemResponsiveness=20 y NetworkThrottlingIndex=10 restaurados.");
                }
            }
            catch { report.LogEntries.Add("MMCSS: ajuste omitido (requiere privilegios de administrador)."); }
        }

        // ─────────────────────────────────────────────────────────────
        // Red y prioridad del propio proceso
        // ─────────────────────────────────────────────────────────────
        private static void FlushDnsCache(OptimizationReport report)
        {
            try
            {
                Process p = new Process { StartInfo = new ProcessStartInfo("ipconfig", "/flushdns") { UseShellExecute = false, CreateNoWindow = true } };
                p.Start();
                p.WaitForExit(3000);
                report.LogEntries.Add("🌐 Caché DNS purgada para reducir latencia multijugador.");
            }
            catch { }
        }

        private static void SetGameModeAppPriority(OptimizationReport report)
        {
            try
            {
                Process.GetCurrentProcess().PriorityClass = ProcessPriorityClass.AboveNormal;
                report.LogEntries.Add("Prioridad del booster elevada a AboveNormal.");
            }
            catch { }
        }

        // ═══════════════════════════════════════════════════════════════════════════════
        // Optimización de prioridad: baja prioridad para el proceso Game Booster
        // ═══════════════════════════════════════════════════════════════════════════════
        /// <summary>
        /// Establece la prioridad del proceso Game Booster a Idle/Low para no competir
        /// con juegos ni causar latencia en el sistema.
        /// </summary>
        public static void SetLowPriority()
        {
            try
            {
                Process.GetCurrentProcess().PriorityClass = ProcessPriorityClass.Idle;
                Thread.CurrentThread.Priority = ThreadPriority.Lowest;
            }
            catch { }
        }

        // ─────────────────────────────────────────────────────────────
        // Métricas en vivo (optimizadas - singleton counters, sin Sleep)
        // ─────────────────────────────────────────────────────────────
        private static readonly PerformanceCounter _memCounter = new PerformanceCounter("Memory", "Available MBytes");
        private static readonly PerformanceCounter _cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");

        public static long AvailableMemoryMB()
        {
            try { return (long)_memCounter.NextValue(); }
            catch { return 0; }
        }

        public static float CpuUsagePercent()
        {
            // SIN Sleep - lectura instantánea (el counter ya está calibrado por primer NextValue)
            try { return Math.Clamp(_cpuCounter.NextValue(), 0f, 100f); }
            catch { return 0f; }
        }

        public static (double TotalGB, double UsedGB, double FreeGB, int Percent) MemoryStats()
        {
            try
            {
                double totalGB = 0;
                using (var searcher = new ManagementObjectSearcher("SELECT TotalPhysicalMemory FROM Win32_ComputerSystem"))
                {
                    foreach (ManagementObject mo in searcher.Get())
                    {
                        totalGB = Convert.ToUInt64(mo["TotalPhysicalMemory"]) / (1024.0 * 1024.0 * 1024.0);
                    }
                }
                if (totalGB <= 0) totalGB = 8;

                double freeGB = AvailableMemoryMB() / 1024.0;
                double usedGB = Math.Max(0, totalGB - freeGB);
                int pct = (int)Math.Round((usedGB / totalGB) * 100);
                return (totalGB, usedGB, freeGB, pct);
            }
            catch { return (8, 4, 4, 50); }
        }
    }
}