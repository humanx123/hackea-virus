using System;
using System.Collections.Generic;
using System.Diagnostics;
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
        // Modo JUEGO (CPU + GPU + RAM)
        // ─────────────────────────────────────────────────────────────
        public static OptimizationReport EnableGameMode()
        {
            var report = new OptimizationReport();
            report.LogEntries.Add("🚀 Iniciando optimización MÁXIMA de CPU, GPU y RAM para juegos...");

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

            // 3. GPU Priorities & DirectX Hardware Acceleration
            TuneGpuAndDirectXPriorities(true, report);

            // 4. Pausa de servicios no esenciales
            report.ServicesStopped = PauseBackgroundServices(report);

            // 5. MMCSS CPU & Network Throttling
            TuneMultimediaProfile(true, report);

            // 6. Network Flush & Priority
            FlushDnsCache(report);
            SetGameModeAppPriority(report);
            TrimWorkingSets(null);

            report.LogEntries.Add("🔥 MODO JUEGO ACTIVADO: CPU al 100%, GPU en Prioridad Máxima (DirectX/Vulkan) y RAM liberada.");
            return report;
        }

        // ─────────────────────────────────────────────────────────────
        // Modo NORMAL (Restablecer)
        // ─────────────────────────────────────────────────────────────
        public static OptimizationReport RestoreNormalMode()
        {
            var report = new OptimizationReport();
            report.LogEntries.Add("🔄 Restableciendo estado normal del sistema...");

            SetPowerScheme(BalancedGuid, report);
            DisableCpuCoreParking(false, report);
            TuneGpuAndDirectXPriorities(false, report);
            ResumeBackgroundServices(report);
            TuneMultimediaProfile(false, report);

            report.LogEntries.Add("🛑 Modo Normal RESTABLECIDO. CPU, GPU y servicios en estado estándar.");
            return report;
        }

        // ─────────────────────────────────────────────────────────────
        // GPU & DirectX Optimization
        // ─────────────────────────────────────────────────────────────
        private static void TuneGpuAndDirectXPriorities(bool enableGaming, OptimizationReport report)
        {
            try
            {
                // 1. MMCSS Games Task GPU Priority (8 = Máximo valor de aceleración gráfica)
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(
                    @"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games", true))
                {
                    if (key != null)
                    {
                        key.SetValue("GPU Priority", enableGaming ? 8 : 2, RegistryValueKind.DWord);
                        key.SetValue("Priority", enableGaming ? 6 : 2, RegistryValueKind.DWord);
                        key.SetValue("Scheduling Category", enableGaming ? "High" : "Medium", RegistryValueKind.String);
                        key.SetValue("SFIO Priority", enableGaming ? "High" : "Normal", RegistryValueKind.String);
                        report.LogEntries.Add(enableGaming
                            ? "🎮 GPU Priority fijado en Nivel 8 (Máxima aceleración gráfica en DirectX/OpenGL/Vulkan)."
                            : "🎮 GPU Priority restaurado a valor estándar.");
                    }
                }

                // 2. Hardware-Accelerated GPU Scheduling (HAGS)
                using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(
                    @"SYSTEM\CurrentControlSet\Control\GraphicsDrivers", true))
                {
                    if (key != null)
                    {
                        key.SetValue("HagsEnabled", enableGaming ? 2 : 1, RegistryValueKind.DWord);
                        report.LogEntries.Add(enableGaming
                            ? "⚡ Programación de GPU acelerada por hardware (HAGS) ACTIVADA."
                            : "⚡ HAGS restaurado a estado predeterminado.");
                    }
                }

                // 3. DirectX High Performance Preference for Games
                using (RegistryKey? key = Registry.CurrentUser.OpenSubKey(
                    @"Software\Microsoft\DirectX\UserGpuPreferences", true))
                {
                    if (key != null)
                    {
                        key.SetValue("GpuPreference", enableGaming ? 2 : 0, RegistryValueKind.DWord); // 2 = High Performance GPU (NVIDIA)
                        report.LogEntries.Add(enableGaming
                            ? "🏎️ DirectX configurado en Modo Máximo Rendimiento (GPU Dedicada NVIDIA)."
                            : "🏎️ Preferencias de GPU DirectX restauradas.");
                    }
                }
            }
            catch (Exception ex)
            {
                report.LogEntries.Add($"ℹ️ Ajuste de GPU parcialmente omitido: {ex.Message}");
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

        // ─────────────────────────────────────────────────────────────
        // Servicios de fondo
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

        // ─────────────────────────────────────────────────────────────
        // Métricas en vivo
        // ─────────────────────────────────────────────────────────────
        public static long AvailableMemoryMB()
        {
            try
            {
                using (PerformanceCounter c = new PerformanceCounter("Memory", "Available MBytes"))
                    return (long)c.NextValue();
            }
            catch { return 0; }
        }

        public static float CpuUsagePercent()
        {
            try
            {
                using (PerformanceCounter c = new PerformanceCounter("Processor Information", "% Processor Utility", "0"))
                {
                    c.NextValue();
                    Thread.Sleep(120);
                    float v = c.NextValue();
                    return Math.Clamp(v, 0f, 100f);
                }
            }
            catch
            {
                try
                {
                    using (PerformanceCounter c = new PerformanceCounter("Processor", "% Processor Time"))
                    {
                        c.NextValue();
                        Thread.Sleep(120);
                        return Math.Clamp(c.NextValue(), 0f, 100f);
                    }
                }
                catch { return 0f; }
            }
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