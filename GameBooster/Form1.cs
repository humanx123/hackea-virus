using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Threading;
using System.Windows.Forms;
using System.Diagnostics;

namespace GameBooster
{
    public partial class MainForm : Form
    {
        private bool _gameModeActive = false;
        private bool _megaretroModeActive = false;
        private Thread? _monitorThread;
        private bool _closing = false;

        // ─────────────────────────────────────────────────────────
        // Componentes de interfaz
        // ─────────────────────────────────────────────────────────
        private Button btnEnableGame = null!;
        private Button btnRestoreNormal = null!;
        private Button btnMegaretroHub = null!;
        private Label lblStatus = null!;
        private Label lblMemory = null!;
        private Label lblCpu = null!;
        private ProgressBar barMemory = null!;
        private ProgressBar barCpu = null!;
        private TextBox txtLog = null!;

        // Colores Tema Gamer Oscuro
        private readonly Color BACK_COLOR = Color.FromArgb(20, 20, 25);
        private readonly Color PANEL_COLOR = Color.FromArgb(30, 30, 40);
        private readonly Color GREEN_NEON = Color.FromArgb(0, 230, 115);
        private readonly Color RED_CORAL = Color.FromArgb(240, 70, 70);
        private readonly Color PURPLE_PURPLE = Color.FromArgb(180, 100, 230);
        private readonly Color TEXT_COLOR = Color.FromArgb(220, 220, 230);

        public MainForm()
        {
            InitializeCustomComponents();
            StartMetricsMonitor();
        }

        private void InitializeCustomComponents()
        {
            this.Text = "Game Booster - Optimizador de Rendimiento";
            this.Size = new Size(600, 700);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = BACK_COLOR;
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.MinimumSize = new Size(600, 700);

            Label lblTitle = new Label
            {
                Text = "⚡ GAME BOOSTER ⚡",
                Font = new Font("Segoe UI", 22, FontStyle.Bold),
                ForeColor = GREEN_NEON,
                Location = new Point(20, 15),
                AutoSize = true
            };
            this.Controls.Add(lblTitle);

            btnEnableGame = CreateGradientButton("🔥 MODO JUEGO", GREEN_NEON, true);
            btnEnableGame.Location = new Point(30, 65);
            btnEnableGame.Size = new Size(220, 85);
            btnEnableGame.Click += BtnEnableGame_Click;
            this.Controls.Add(btnEnableGame);

            btnMegaretroHub = CreateGradientButton("🎮 MEGARETRO HUB", PURPLE_PURPLE, true);
            btnMegaretroHub.Location = new Point(260, 65);
            btnMegaretroHub.Size = new Size(220, 85);
            btnMegaretroHub.Click += BtnMegaretroHub_Click;
            this.Controls.Add(btnMegaretroHub);

            btnRestoreNormal = CreateGradientButton("⏹ NORMAL", RED_CORAL, false);
            btnRestoreNormal.Location = new Point(490, 65);
            btnRestoreNormal.Size = new Size(190, 85);
            btnRestoreNormal.Click += BtnRestoreNormal_Click;
            this.Controls.Add(btnRestoreNormal);

            lblStatus = new Label
            {
                Text = "Estado: Sistema en modo normal",
                Font = new Font("Segoe UI", 12),
                ForeColor = TEXT_COLOR,
                Location = new Point(30, 165),
                AutoSize = true
            };
            this.Controls.Add(lblStatus);

            lblMemory = new Label
            {
                Text = "0.0 / 0.0 GB (0%)",
                Font = new Font("Consolas", 14),
                ForeColor = TEXT_COLOR,
                Location = new Point(30, 245),
                AutoSize = true
            };
            this.Controls.Add(lblMemory);

            barMemory = new ProgressBar
            {
                Location = new Point(30, 270),
                Size = new Size(540, 24),
                Style = ProgressBarStyle.Continuous,
                Minimum = 0,
                Maximum = 100
            };
            this.Controls.Add(barMemory);

            lblCpu = new Label
            {
                Text = "0%",
                Font = new Font("Consolas", 14),
                ForeColor = TEXT_COLOR,
                Location = new Point(30, 345),
                AutoSize = true
            };
            this.Controls.Add(lblCpu);

            barCpu = new ProgressBar
            {
                Location = new Point(30, 370),
                Size = new Size(540, 24),
                Style = ProgressBarStyle.Continuous,
                Minimum = 0,
                Maximum = 100
            };
            this.Controls.Add(barCpu);

            txtLog = new TextBox
            {
                Location = new Point(30, 445),
                Size = new Size(540, 180),
                Multiline = true,
                ReadOnly = true,
                BackColor = Color.FromArgb(25, 25, 30),
                ForeColor = Color.FromArgb(160, 220, 160),
                Font = new Font("Consolas", 9),
                ScrollBars = ScrollBars.Vertical,
                BorderStyle = BorderStyle.FixedSingle
            };
            this.Controls.Add(txtLog);
        }

        private Button CreateGradientButton(string text, Color baseColor, bool isGreen)
        {
            var btn = new Button
            {
                Text = text,
                Font = new Font("Segoe UI", 14, FontStyle.Bold),
                FlatStyle = FlatStyle.Flat,
                ForeColor = isGreen ? Color.Black : Color.White,
                BackColor = baseColor,
                FlatAppearance = { BorderSize = 0 },
                Cursor = Cursors.Hand,
                UseVisualStyleBackColor = false,
                TextAlign = ContentAlignment.MiddleCenter
            };

            btn.Paint += (s, e) =>
            {
                var g = e.Graphics;
                g.SmoothingMode = SmoothingMode.AntiAlias;

                using (var brush = new SolidBrush(baseColor))
                    g.FillRectangle(brush, btn.ClientRectangle);

                TextRenderer.DrawText(g, btn.Text, btn.Font, btn.ClientRectangle, btn.ForeColor,
                    TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
            };
            return btn;
        }

        private void AppendLog(string line)
        {
            if (txtLog.InvokeRequired)
            {
                txtLog.Invoke(() => AppendLog(line));
                return;
            }
            string timestamp = DateTime.Now.ToString("HH:mm:ss");
            txtLog.AppendText($"[{timestamp}] {line}\r\n");
            txtLog.SelectionStart = txtLog.Text.Length;
            txtLog.ScrollToCaret();
        }

        private void BtnEnableGame_Click(object? sender, EventArgs e)
        {
            if (_gameModeActive || _megaretroModeActive) return;
            btnEnableGame.Enabled = false;

            new Thread(() =>
            {
                try
                {
                    var report = Win32Optimizer.EnableGameMode();
                    foreach (var entry in report.LogEntries)
                        AppendLog(entry);

                    _gameModeActive = true;
                    this.Invoke(() =>
                    {
                        lblStatus.Text = "✅ Estado: MODO JUEGO ACTIVADO 🔥";
                        lblStatus.ForeColor = GREEN_NEON;
                        btnEnableGame.Enabled = false;
                        btnRestoreNormal.Enabled = true;
                        btnEnableGame.Invalidate();
                    });
                }
                catch (Exception ex)
                {
                    AppendLog($"ERROR: {ex.Message}");
                    this.Invoke(() => { btnEnableGame.Enabled = true; btnEnableGame.Invalidate(); });
                }
            }).Start();
        }

        private void BtnMegaretroHub_Click(object? sender, EventArgs e)
        {
            if (_gameModeActive || _megaretroModeActive) return;

            string megaretroPath = @"C:\Program Files Megaretro\Megaretro Hub\MegaretroHub.exe";
            if (!System.IO.File.Exists(megaretroPath))
            {
                var possiblePaths = new[]
                {
                    @"C:\Program Files\Megaretro Hub\MegaretroHub.exe",
                    @"C:\Program Files (x86)\Megaretro Hub\MegaretroHub.exe",
                    Environment.ExpandEnvironmentVariables(@"%LOCALAPPDATA%\Megaretro\MegaretroHub.exe"),
                    @"C:\Users\Public\Megaretro\MegaretroHub.exe"
                };
                foreach (var p in possiblePaths)
                {
                    if (System.IO.File.Exists(p))
                    {
                        megaretroPath = p;
                        break;
                    }
                }
            }

            btnMegaretroHub.Enabled = false;

            new Thread(() =>
            {
                try
                {
                    var report = Win32Optimizer.EnableMegaretroHubMode(megaretroPath);
                    foreach (var entry in report.LogEntries)
                        AppendLog(entry);

                    _megaretroModeActive = true;
                    this.Invoke(() =>
                    {
                        lblStatus.Text = "✅ Estado: MEGARETRO HUB MODE ACTIVADO 🎮";
                        lblStatus.ForeColor = PURPLE_PURPLE;
                        btnEnableGame.Enabled = false;
                        btnRestoreNormal.Enabled = true;
                        btnMegaretroHub.Enabled = false;
                        btnMegaretroHub.Invalidate();
                    });
                }
                catch (Exception ex)
                {
                    AppendLog($"ERROR Megaretro Hub: {ex.Message}");
                    this.Invoke(() => { btnMegaretroHub.Enabled = true; btnMegaretroHub.Invalidate(); });
                }
            }).Start();
        }

        private void BtnRestoreNormal_Click(object? sender, EventArgs e)
        {
            btnEnableGame.Enabled = false;
            btnRestoreNormal.Enabled = false;
            btnMegaretroHub.Enabled = false;
            btnEnableGame.Invalidate();
            btnRestoreNormal.Invalidate();

            new Thread(() =>
            {
                try
                {
                    var report = Win32Optimizer.RestoreNormalMode();
                    foreach (var entry in report.LogEntries)
                        AppendLog(entry);

                    _gameModeActive = false;
                    _megaretroModeActive = false;
                    this.Invoke(() =>
                    {
                        lblStatus.Text = "Estado: Sistema en modo normal";
                        lblStatus.ForeColor = TEXT_COLOR;
                        btnEnableGame.Enabled = true;
                        btnRestoreNormal.Enabled = false;
                        btnMegaretroHub.Enabled = true;
                    });
                }
                catch (Exception ex)
                {
                    AppendLog($"ERROR: {ex.Message}");
                    this.Invoke(() =>
                    {
                        btnEnableGame.Enabled = true;
                        btnRestoreNormal.Enabled = true;
                    });
                }
            }).Start();
        }

        private void StartMetricsMonitor()
        {
            btnRestoreNormal.Enabled = false;
            btnMegaretroHub.Enabled = true;
            _monitorThread = new Thread(MonitorLoop)
            {
                IsBackground = true,
                Priority = ThreadPriority.BelowNormal
            };
            _monitorThread.Start();
        }

        private void MonitorLoop()
        {
            while (!_closing)
            {
                try
                {
                    var mem = Win32Optimizer.MemoryStats();
                    float cpu = Win32Optimizer.CpuUsagePercent();

                    if (!this.IsDisposed && this.IsHandleCreated)
                    {
                        this.Invoke(() =>
                        {
                            lblMemory.Text = $"{mem.UsedGB:F1} / {mem.TotalGB:F1} GB ({mem.Percent}%)";
                            lblCpu.Text = $"{cpu:F0}%";
                            barMemory.Value = Math.Clamp(mem.Percent, 0, 100);
                            barCpu.Value = Math.Clamp((int)cpu, 0, 100);
                        });
                    }
                }
                catch { }

                Thread.Sleep(750);
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            _closing = true;
            if (_gameModeActive || _megaretroModeActive)
            {
                try { Win32Optimizer.RestoreNormalMode(); }
                catch { }
            }
            base.OnFormClosing(e);
        }
    }
}