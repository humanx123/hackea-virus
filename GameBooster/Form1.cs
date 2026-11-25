using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Threading;
using System.Windows.Forms;
using System.Diagnostics;
using System.Linq;

namespace GameBooster
{
    public partial class MainForm : Form
    {
        private bool _gameModeActive = false;
        private Thread? _monitorThread;
        private bool _closing = false;

        // ─────────────────────────────────────────────────────────
        // Componentes de interfaz
        // ─────────────────────────────────────────────────────────
        private Button btnEnableGame = null!;
        private Button btnRestoreNormal = null!;
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
        private readonly Color TEXT_COLOR = Color.FromArgb(220, 220, 230);

        public MainForm()
        {
            InitializeCustomComponents();
            StartMetricsMonitor();
        }

        private void InitializeCustomComponents()
        {
            // Formulario principal
            this.Text = "Game Booster - Optimizador de Rendimiento";
            this.Size = new Size(580, 640);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = BACK_COLOR;
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;

            // ─── TÍTULO ───
            Label lblTitle = new Label
            {
                Text = "⚡ GAME BOOSTER ⚡",
                Font = new Font("Segoe UI", 20, FontStyle.Bold),
                ForeColor = GREEN_NEON,
                Location = new Point(20, 15),
                AutoSize = true
            };
            this.Controls.Add(lblTitle);

            // ─── BOTÓN MODO JUEGO (VERDE) ───
            btnEnableGame = CreateGradientButton("🔥 MODO JUEGO", GREEN_NEON, true);
            btnEnableGame.Location = new Point(30, 65);
            btnEnableGame.Size = new Size(240, 90);
            btnEnableGame.Click += BtnEnableGame_Click;
            this.Controls.Add(btnEnableGame);

            // ─── BOTÓN RESTABLECER (ROJO) ───
            btnRestoreNormal = CreateGradientButton("⏹ RESTABLECER", RED_CORAL, false);
            btnRestoreNormal.Location = new Point(290, 65);
            btnRestoreNormal.Size = new Size(240, 90);
            btnRestoreNormal.Click += BtnRestoreNormal_Click;
            this.Controls.Add(btnRestoreNormal);

            // ─── ESTADO ───
            lblStatus = new Label
            {
                Text = "Estado: Sistema en modo normal",
                Font = new Font("Segoe UI", 12),
                ForeColor = TEXT_COLOR,
                Location = new Point(30, 170),
                AutoSize = true
            };
            this.Controls.Add(lblStatus);

            // ─── MEMORIA RAM ───
            Label lblMemTitle = new Label
            {
                Text = "💾 MEMORIA RAM",
                Font = new Font("Segoe UI", 11, FontStyle.Bold),
                ForeColor = TEXT_COLOR,
                Location = new Point(30, 205),
                AutoSize = true
            };
            this.Controls.Add(lblMemTitle);

            lblMemory = new Label
            {
                Text = "0.0 / 0.0 GB (0%)",
                Font = new Font("Consolas", 14),
                ForeColor = TEXT_COLOR,
                Location = new Point(30, 230),
                AutoSize = true
            };
            this.Controls.Add(lblMemory);

            barMemory = new ProgressBar
            {
                Location = new Point(30, 255),
                Size = new Size(510, 22),
                Style = ProgressBarStyle.Continuous,
                Minimum = 0,
                Maximum = 100
            };
            this.Controls.Add(barMemory);

            // ─── CPU ───
            Label lblCpuTitle = new Label
            {
                Text = "🖥️ USO DE CPU",
                Font = new Font("Segoe UI", 11, FontStyle.Bold),
                ForeColor = TEXT_COLOR,
                Location = new Point(30, 295),
                AutoSize = true
            };
            this.Controls.Add(lblCpuTitle);

            lblCpu = new Label
            {
                Text = "0%",
                Font = new Font("Consolas", 14),
                ForeColor = TEXT_COLOR,
                Location = new Point(30, 320),
                AutoSize = true
            };
            this.Controls.Add(lblCpu);

            barCpu = new ProgressBar
            {
                Location = new Point(30, 345),
                Size = new Size(510, 22),
                Style = ProgressBarStyle.Continuous,
                Minimum = 0,
                Maximum = 100
            };
            this.Controls.Add(barCpu);

            // ─── LOG DE ACTIVIDAD ───
            Label lblLogTitle = new Label
            {
                Text = "📋 Registro de optimización",
                Font = new Font("Segoe UI", 11, FontStyle.Bold),
                ForeColor = TEXT_COLOR,
                Location = new Point(30, 385),
                AutoSize = true
            };
            this.Controls.Add(lblLogTitle);

            txtLog = new TextBox
            {
                Location = new Point(30, 410),
                Size = new Size(510, 160),
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
                Font = new Font("Segoe UI", 15, FontStyle.Bold),
                FlatStyle = FlatStyle.Flat,
                ForeColor = isGreen ? Color.Black : Color.White,
                BackColor = baseColor,
                FlatAppearance = { BorderSize = 0 },
                Cursor = Cursors.Hand,
                UseVisualStyleBackColor = false
            };

            btn.Paint += (s, e) =>
            {
                var g = e.Graphics;
                g.SmoothingMode = SmoothingMode.AntiAlias;

                using (var brush = new SolidBrush(btn.Enabled ? baseColor : Color.FromArgb(60, 60, 70)))
                    g.FillRectangle(brush, btn.ClientRectangle);

                Color textColor = btn.Enabled ? (isGreen ? Color.Black : Color.White) : Color.Gray;

                TextRenderer.DrawText(g, btn.Text, btn.Font, btn.ClientRectangle, textColor,
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
            if (_gameModeActive) return;
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
                        lblStatus.Text = "Estado: MODO JUEGO ACTIVADO 🔥";
                        lblStatus.ForeColor = GREEN_NEON;
                        btnEnableGame.Enabled = false;
                        btnRestoreNormal.Enabled = true;
                        btnRestoreNormal.Invalidate();
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

        private void BtnRestoreNormal_Click(object? sender, EventArgs e)
        {
            if (!_gameModeActive) return;
            btnRestoreNormal.Enabled = false;

            new Thread(() =>
            {
                try
                {
                    var report = Win32Optimizer.RestoreNormalMode();
                    foreach (var entry in report.LogEntries)
                        AppendLog(entry);

                    _gameModeActive = false;
                    this.Invoke(() =>
                    {
                        lblStatus.Text = "Estado: Sistema en modo normal";
                        lblStatus.ForeColor = TEXT_COLOR;
                        btnRestoreNormal.Enabled = false;
                        btnEnableGame.Enabled = true;
                        btnRestoreNormal.Invalidate();
                        btnEnableGame.Invalidate();
                    });
                }
                catch (Exception ex)
                {
                    AppendLog($"ERROR: {ex.Message}");
                    this.Invoke(() => { btnRestoreNormal.Enabled = true; btnRestoreNormal.Invalidate(); });
                }
            }).Start();
        }

        private void StartMetricsMonitor()
        {
            btnRestoreNormal.Enabled = false;
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

                Thread.Sleep(800);
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            _closing = true;
            if (_gameModeActive)
            {
                try { Win32Optimizer.RestoreNormalMode(); }
                catch { }
            }
            base.OnFormClosing(e);
        }
    }
}