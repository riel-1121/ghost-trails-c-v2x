using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;

namespace GhostTrailsDemo;

public enum VehicleType { Lead, Follow }

public class Vehicle
{
    public int Id { get; set; }
    public float X { get; set; }
    public float Y { get; set; }
    public float Speed { get; set; }
    public Color Color { get; set; }
    public VehicleType Type { get; set; }
    public float Direction { get; set; }
    public float LateralSpeed { get; set; }
}

public class Ghost
{
    public float X { get; set; }
    public float Y { get; set; }
    public float Age { get; set; }
    public float MaxAge { get; set; }
}

public class SimulationData
{
    public List<Vehicle> Vehicles { get; set; } = new();
    public List<Ghost> Ghosts { get; set; } = new();
    public float HighwayLength { get; set; }
    public float IcePosition { get; set; }
    public float TotalTime { get; set; }
}

public class GhostTrailsDemo
{
    private readonly List<Vehicle> _vehicles = new();
    private readonly List<Ghost> _ghosts = new();
    private readonly float _highwayLength = 1500;
    private readonly float _icePosition = 300;
    private float _totalTime;

    public GhostTrailsDemo()
    {
        Reset();
    }

    public void Reset()
    {
        _vehicles.Clear();
        _vehicles.AddRange(new[]
        {
            new Vehicle { Id = 0, X = 50, Y = 50, Speed = 5, Color = Color.FromArgb(52, 152, 219), Type = VehicleType.Lead, Direction = 0, LateralSpeed = 0 }, // Blue lead
            new Vehicle { Id = 1, X = 200, Y = 50, Speed = 5, Color = Color.FromArgb(231, 76, 60), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Red follow
            new Vehicle { Id = 2, X = 350, Y = 50, Speed = 5, Color = Color.FromArgb(39, 174, 96), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Green follow
            new Vehicle { Id = 3, X = 500, Y = 50, Speed = 5, Color = Color.FromArgb(241, 196, 15), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Orange follow
            new Vehicle { Id = 4, X = 100, Y = 50, Speed = 4.5f, Color = Color.FromArgb(155, 89, 182), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Purple
            new Vehicle { Id = 5, X = 250, Y = 50, Speed = 5.5f, Color = Color.FromArgb(26, 188, 156), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Teal
            new Vehicle { Id = 6, X = 400, Y = 50, Speed = 4, Color = Color.FromArgb(230, 126, 34), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Carrot
            new Vehicle { Id = 7, X = 150, Y = 50, Speed = 5.2f, Color = Color.FromArgb(52, 73, 94), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Dark blue
            new Vehicle { Id = 8, X = 300, Y = 50, Speed = 4.8f, Color = Color.FromArgb(22, 160, 133), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Green sea
            new Vehicle { Id = 9, X = 450, Y = 50, Speed = 5.3f, Color = Color.FromArgb(241, 196, 15), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Yellow
            new Vehicle { Id = 10, X = 50, Y = 50, Speed = 4.7f, Color = Color.FromArgb(231, 76, 60), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Red
            new Vehicle { Id = 11, X = 200, Y = 50, Speed = 5.1f, Color = Color.FromArgb(155, 89, 182), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Purple
            new Vehicle { Id = 12, X = 350, Y = 50, Speed = 4.9f, Color = Color.FromArgb(39, 174, 96), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Green
            new Vehicle { Id = 13, X = 500, Y = 50, Speed = 5.4f, Color = Color.FromArgb(241, 196, 15), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Orange
            new Vehicle { Id = 14, X = 100, Y = 50, Speed = 4.6f, Color = Color.FromArgb(26, 188, 156), Type = VehicleType.Follow, Direction = 0, LateralSpeed = 0 }, // Teal
        });
        _ghosts.Clear();
        _totalTime = 0;
    }

    public void Step(float deltaTime)
    {
        _totalTime += deltaTime;

        foreach (var vehicle in _vehicles)
        {
            if (vehicle.Type == VehicleType.Follow)
            {
                float lateralForce = 0;
                foreach (var ghost in _ghosts)
                {
                    float dx = ghost.X - vehicle.X;
                    float dist = Math.Abs(dx);
                    if (dist < 120 && ghost.Age < 60)
                    {
                        float strength = (1 - ghost.Age / 60) * 0.2f;
                        lateralForce += strength * (dx > 0 ? -1 : 1);
                    }
                }
                vehicle.LateralSpeed += lateralForce * 0.05f;
                vehicle.LateralSpeed *= 0.95f;
                vehicle.Y = 50 + vehicle.LateralSpeed * 10;
            }
            vehicle.X += vehicle.Speed;
            if (vehicle.X > _highwayLength)
            {
                vehicle.X = -50;
                vehicle.Direction = 0;
                vehicle.LateralSpeed = 0;
                vehicle.Y = 50;
            }
        }

        var lead = _vehicles.FirstOrDefault(v => v.Type == VehicleType.Lead);
        if (lead != null && lead.X >= _icePosition - 5 && lead.X <= _icePosition + 5 && _ghosts.Count == 0)
        {
            lead.X += (float)((new Random().NextDouble() - 0.5) * 20);
            lead.Y += (float)((new Random().NextDouble() - 0.5) * 10);
            _ghosts.Add(new Ghost { X = _icePosition, Y = 50, Age = 0, MaxAge = 60 });
        }

        if (_totalTime > 8 && _ghosts.Count == 1)
        {
            _ghosts.Add(new Ghost { X = _icePosition + 100, Y = 50, Age = 0, MaxAge = 60 });
        }

        foreach (var ghost in _ghosts)
        {
            ghost.Age += deltaTime;
        }
        _ghosts.RemoveAll(ghost => ghost.Age >= ghost.MaxAge);
    }

    public SimulationData GetData()
    {
        return new SimulationData
        {
            Vehicles = new List<Vehicle>(_vehicles),
            Ghosts = new List<Ghost>(_ghosts),
            HighwayLength = _highwayLength,
            IcePosition = _icePosition,
            TotalTime = _totalTime
        };
    }
}