using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Windows.Forms;

namespace GhostTrailsDemo;

public partial class MainForm : Form
{
    private readonly GhostTrailsDemo _demo;
    private readonly Timer _timer;
    private readonly List<string> _denmLogs;
    private int _packetCount;
    private bool _freezeShown;

    public MainForm()
    {
        InitializeComponent();
        _demo = new GhostTrailsDemo();
        _timer = new Timer { Interval = 80 };
        _timer.Tick += Timer_Tick;
        _timer.Start();
        _denmLogs = new List<string>
        {
            "DENM: 00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF",
            "DENM: 112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00",
            "DENM: 2233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF0011",
            "DENM: 33445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF001122",
            "DENM: 445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233"
        };
    }

    private void InitializeComponent()
    {
        this.Text = "Ghost Trails — C-V2X Swarm Intelligence";
        this.Size = new Size(1200, 800);
        this.BackColor = Color.Black;
        this.DoubleBuffered = true;
        this.Paint += MainForm_Paint;
        this.Resize += (s, e) => this.Invalidate();
    }

    private void Timer_Tick(object? sender, EventArgs e)
    {
        _demo.Step(0.08f);
        var data = _demo.GetData();
        _packetCount++;

        if (data.Ghosts.Count > 0 && !_freezeShown)
        {
            _freezeShown = true;
            // Could add freeze text logic here
        }

        this.Invalidate();
    }

    private void MainForm_Paint(object? sender, PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        var data = _demo.GetData();

        // Background buildings
        using (var brush = new SolidBrush(Color.FromArgb(51, 51, 51)))
        {
            for (int i = 0; i < 10; i++)
            {
                int x = i * 150;
                int h = 50 + (int)(Math.Sin(i) * 20);
                g.FillRectangle(brush, x, this.Height - h, 100, h);
            }
        }

        // Highway lanes
        using (var pen = new Pen(Color.White, 2))
        {
            for (int y = 50; y < this.Height - 50; y += 50)
            {
                g.DrawLine(pen, 0, y, this.Width, y);
            }
        }

        // Ego-glow for lead car
        var lead = data.Vehicles.FirstOrDefault(v => v.Type == VehicleType.Lead);
        if (lead != null)
        {
            float screenX = (lead.X / data.HighwayLength) * this.Width;
            float screenY = lead.Y;
            using (var brush = new SolidBrush(Color.FromArgb(64, 0, 255, 255)))
            {
                g.FillEllipse(brush, screenX - 30, screenY - 30, 60, 60);
            }
        }

        // Vehicles
        foreach (var vehicle in data.Vehicles)
        {
            float screenX = (vehicle.X / data.HighwayLength) * this.Width;
            float screenY = vehicle.Y;
            using (var brush = new SolidBrush(vehicle.Color))
            {
                // Draw arrow
                PointF[] points = {
                    new PointF(screenX, screenY),
                    new PointF(screenX - 10, screenY - 5),
                    new PointF(screenX - 10, screenY + 5)
                };
                g.FillPolygon(brush, points);
            }
        }

        // Ghosts
        foreach (var ghost in data.Ghosts)
        {
            float screenX = (ghost.X / data.HighwayLength) * this.Width;
            float screenY = ghost.Y;
            float alpha = 1 - ghost.Age / ghost.MaxAge;
            int alphaInt = (int)(alpha * 255);
            float pulse = 1 + (float)Math.Sin(ghost.Age * 10) * 0.2f;

            using (var brush = new SolidBrush(Color.FromArgb(alphaInt, 255, 0, 0)))
            {
                g.FillEllipse(brush, screenX - 10 * pulse, screenY - 5 * pulse, 20 * pulse, 10 * pulse);
            }

            using (var brush = new SolidBrush(Color.White))
            using (var font = new Font("Arial", 16))
            {
                g.DrawString("!", font, brush, screenX - 3, screenY - 8);
            }

            // Range ring
            using (var pen = new Pen(Color.FromArgb(alphaInt, 255, 255, 0)))
            {
                g.DrawEllipse(pen, screenX - 60, screenY - 60, 120, 120);
            }

            // Countdown timer
            using (var brush = new SolidBrush(Color.FromArgb(alphaInt, 0, 255, 255)))
            using (var font = new Font("Arial", 12))
            {
                string timeLeft = Math.Max(0, ghost.MaxAge - ghost.Age).ToString("F1");
                g.DrawString(timeLeft + "s", font, brush, screenX - 15, screenY - 25);
            }
        }

        // Latency lines
        if (data.Ghosts.Count > 0)
        {
            var ghost = data.Ghosts[0];
            float ghostX = (ghost.X / data.HighwayLength) * this.Width;
            using (var pen = new Pen(Color.FromArgb(255, 0, 0, 255), 1))
            {
                foreach (var vehicle in data.Vehicles.Where(v => v.Type == VehicleType.Follow))
                {
                    float screenX = (vehicle.X / data.HighwayLength) * this.Width;
                    g.DrawLine(pen, screenX, vehicle.Y, ghostX, ghost.Y);
                }
            }
        }

        // Radio ripple
        if (data.Ghosts.Count > 0)
        {
            var ghost = data.Ghosts[0];
            float ghostX = (ghost.X / data.HighwayLength) * this.Width;
            float rippleAge = ghost.Age % 2;
            using (var pen = new Pen(Color.FromArgb((int)((1 - rippleAge) * 255), 0, 255, 0)))
            {
                g.DrawEllipse(pen, ghostX - rippleAge * 100, ghost.Y - rippleAge * 100, rippleAge * 200, rippleAge * 200);
            }
        }

        // Stats
        using (var brush = new SolidBrush(Color.LimeGreen))
        using (var font = new Font("Courier New", 12))
        {
            g.DrawString($"Packets: {_packetCount} | Ghosts: {data.Ghosts.Count} | Time: {data.TotalTime:F1}s",
                        font, brush, 10, 10);
        }

        // DENM Log
        using (var brush = new SolidBrush(Color.LimeGreen))
        using (var font = new Font("Courier New", 10))
        {
            g.DrawString("DENM Log:", font, brush, 10, this.Height - 220);
            if (data.Ghosts.Count > 0)
            {
                var logEntry = _denmLogs[new Random().Next(_denmLogs.Count)];
                g.DrawString(logEntry, font, brush, 10, this.Height - 200);
            }
        }

        // Freeze text
        if (_freezeShown)
        {
            using (var brush = new SolidBrush(Color.Red))
            using (var font = new Font("Arial", 48, FontStyle.Bold))
            {
                var text = "FREEZE!";
                var size = g.MeasureString(text, font);
                g.DrawString(text, font, brush,
                           (this.Width - size.Width) / 2,
                           (this.Height - size.Height) / 2);
            }
        }
    }
}