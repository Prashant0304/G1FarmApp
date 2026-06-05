using System;
using System.Collections.Generic;

namespace FarmerApp.Models;

public partial class MasterDistrict
{
    public int DistrictId { get; set; }

    public string? DistrictName { get; set; }

    public int? StateId { get; set; }

    public virtual MasterState? State { get; set; }
}
