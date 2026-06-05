using System;
using System.Collections.Generic;

namespace FarmerApp.Models;

public partial class Farmer
{
    public int FarmerId { get; set; }

    public string? Name { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Village { get; set; }

    public int? StateId { get; set; }

    public int? DistrictId { get; set; }

    public bool? IsVerified { get; set; }

    public DateTime? CreatedDate { get; set; }

    public virtual ICollection<FarmerLand> FarmerLands { get; set; } = new List<FarmerLand>();
}
