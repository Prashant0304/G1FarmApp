using System;
using System.Collections.Generic;

namespace FarmerApp.Models;

public partial class MasterState
{
    public int StateId { get; set; }

    public string? StateName { get; set; }

    public virtual ICollection<MasterDistrict> MasterDistricts { get; set; } = new List<MasterDistrict>();
}
