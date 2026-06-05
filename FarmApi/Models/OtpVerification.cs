using System;
using System.Collections.Generic;

namespace FarmerApp.Models;

public partial class OtpVerification
{
    public int Id { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Otp { get; set; }

    public DateTime? ExpiryTime { get; set; }

    public bool? IsUsed { get; set; }
}
