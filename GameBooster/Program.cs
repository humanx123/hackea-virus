using System;
using System.Windows.Forms;
using System.Runtime.InteropServices;

namespace GameBooster
{
    internal static class Program
    {
        [DllImport("shcore.dll")]
        private static extern int SetProcessDpiAwareness(int PROCESS_DPI_AWARENESS);

        [STAThread]
        static void Main()
        {
            // DPI awareness (Per-Monitor v2)
            SetProcessDpiAwareness(2);

            ApplicationConfiguration.Initialize();
            Application.Run(new MainForm());
        }
    }
}