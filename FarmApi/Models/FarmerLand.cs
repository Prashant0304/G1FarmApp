using System;
using System.Collections.Generic;

namespace FarmerApp.Models;

public partial class FarmerLand
{
    public int LandId { get; set; }

    public int? FarmerId { get; set; }

    public string? Location { get; set; }

    public string? SoilType { get; set; }

    public string? WaterSource { get; set; }

    public decimal? LandSize { get; set; }

    public string? LandUom { get; set; }

    public DateTime? CreatedDate { get; set; }

    public virtual Farmer? Farmer { get; set; }
}
