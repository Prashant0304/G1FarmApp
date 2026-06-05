using FarmApi.Models.DTO;
using FarmApi.Models.Response;
using FarmerApp.DTOs;
using FarmerApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FarmApi.Services
{
    public class FarmerAppDbContext: DbContext
    {
        public FarmerAppDbContext()
        {
        }

        public FarmerAppDbContext(DbContextOptions<FarmerAppDbContext> options)
            : base(options)
        {
        }
        public DbSet<RegisterFarmerResponseDto> RegisterResults { get; set; }

        public DbSet<VerifyOtpResponseDto> VerifyOtpResults { get; set; }

        public DbSet<OtpResultViewModel> OtpResults { get; set; }

        public DbSet<SendOtpResponseDto> SendOtpResults { get; set; }

        public DbSet<SaveFarmerLandRequestDto> saveFarmerLandRequestDtos { get; set; }

        public DbSet<LandUOMDto> LandUOMs { get; set; }

        public DbSet<ResendOtpResponseDto> ResendOtpResponseDtos { get; set; }

        public DbSet<TempFarmerLandResult> TempFarmerLandResults { get; set; }

        public DbSet<CheckUserResponseDto> CheckUserResponses { get; set; }

        public DbSet<FarmerLandDto> FarmerLandDtos { get; set; }

        public DbSet<StateViewModel> StateViewModels { get; set; }

        public DbSet<DistrictViewModel> DistrictViewModels { get; set; }
        public DbSet<AdminLoginResponseDto>  AdminLoginResponses{ get; set; }

        public DbSet<FarmerProfileDto> FarmerProfiles { get; set; }
        public DbSet<AddFarmerLandDto> AddFarmerLandDtos { get; set; }
        public DbSet<InvestorProfileDto> InvestorProfileDtos { get; set; }
        public DbSet<InvestorLoginResponseDto> InvestorLoginResponseDtos { get; set; }

        public DbSet<HobliDto> HobliViewModels { get; set; }

        public DbSet<InvestorDashboardDto> InvestorDashboardDtos { get; set; }

        public DbSet<UpdateInvestorProfileDto> UpdateInvestorProfileDtos{ get; set; }

        public DbSet<ChangeInvestorPasswordDto> ChangeInvestorPasswordDtos { get; set; }

        public DbSet<ProjectIdResponse> ProjectIdResponses { get; set; }

        public DbSet<ProjectResponse> ProjectResponses { get; set; }

        public DbSet<InvestorPaymentScheduleDto> InvestorPaymentScheduleDtos { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<Farmer>(entity =>
            {
                entity.HasKey(e => e.FarmerId).HasName("PK__Farmers__731B88889A4E94E6");

                entity.HasIndex(e => e.PhoneNumber, "UQ__Farmers__85FB4E38E18F4726").IsUnique();

                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
                entity.Property(e => e.IsVerified).HasDefaultValue(false);
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).HasMaxLength(15);
                entity.Property(e => e.Village).HasMaxLength(100);
            });

            modelBuilder.Entity<FarmerLand>(entity =>
            {
                entity.HasKey(e => e.LandId).HasName("PK__FarmerLa__A2856405C3CAEC8E");

                entity.ToTable("FarmerLand");

                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
                entity.Property(e => e.LandSize).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.LandUom)
                    .HasMaxLength(20)
                    .HasColumnName("LandUOM");
                entity.Property(e => e.Location).HasMaxLength(200);
                entity.Property(e => e.SoilType).HasMaxLength(50);
                entity.Property(e => e.WaterSource).HasMaxLength(50);

                entity.HasOne(d => d.Farmer).WithMany(p => p.FarmerLands)
                    .HasForeignKey(d => d.FarmerId)
                    .HasConstraintName("FK__FarmerLan__Farme__571DF1D5");
            });

            modelBuilder.Entity<MasterDistrict>(entity =>
            {
                entity.HasKey(e => e.DistrictId).HasName("PK__MasterDi__85FDA4C6E3EB41D2");

                entity.Property(e => e.DistrictName).HasMaxLength(100);

                entity.HasOne(d => d.State).WithMany(p => p.MasterDistricts)
                    .HasForeignKey(d => d.StateId)
                    .HasConstraintName("FK__MasterDis__State__4CA06362");
            });

            modelBuilder.Entity<MasterState>(entity =>
            {
                entity.HasKey(e => e.StateId).HasName("PK__MasterSt__C3BA3B3AEEC926B4");

                entity.Property(e => e.StateName).HasMaxLength(100);
            });

            modelBuilder.Entity<OtpVerification>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__OtpVerif__3214EC072C8633F4");

                entity.ToTable("OtpVerification");

                entity.Property(e => e.ExpiryTime).HasColumnType("datetime");
                entity.Property(e => e.IsUsed).HasDefaultValue(false);
                entity.Property(e => e.Otp)
                    .HasMaxLength(6)
                    .HasColumnName("OTP");
                entity.Property(e => e.PhoneNumber).HasMaxLength(15);
            });

            modelBuilder.Entity<StateViewModel>().HasNoKey();

            modelBuilder.Entity<DistrictViewModel>().HasNoKey();

            modelBuilder.Entity<RegisterFarmerResponseDto>().HasNoKey();

            modelBuilder.Entity<OtpResultViewModel>().HasNoKey();

            modelBuilder.Entity<VerifyOtpResponseDto>().HasNoKey();

            modelBuilder.Entity<SendOtpResponseDto>().HasNoKey();

            modelBuilder.Entity<LandUOMDto>().HasNoKey();

            modelBuilder.Entity<SaveFarmerLandRequestDto>().HasNoKey();

            modelBuilder.Entity<ResendOtpResponseDto>().HasNoKey();

            modelBuilder.Entity<TempFarmerLandResult>().HasNoKey();

            modelBuilder.Entity<CheckUserResponseDto>().HasNoKey();

            modelBuilder.Entity<AdminLoginResponseDto>().HasNoKey();

            modelBuilder.Entity<FarmerProfileDto>().HasNoKey();

            modelBuilder.Entity<FarmerLandDto>().HasNoKey();

            modelBuilder.Entity<AddFarmerLandDto>().HasNoKey();

            modelBuilder.Entity<InvestorProfileDto>().HasNoKey();

            modelBuilder.Entity<InvestorLoginResponseDto>().HasNoKey();

            modelBuilder.Entity<HobliDto>().HasNoKey();

            modelBuilder.Entity<InvestorDashboardDto>().HasNoKey();

            modelBuilder.Entity<UpdateInvestorProfileDto>().HasNoKey();

            modelBuilder.Entity<ChangeInvestorPasswordDto>().HasNoKey();

            modelBuilder.Entity<InvestorDashboardDto>().HasNoKey();

            modelBuilder.Entity<ProjectIdResponse>().HasNoKey();

            modelBuilder.Entity<ProjectResponse>().HasNoKey();

            modelBuilder.Entity<InvestorPaymentScheduleDto>().HasNoKey();

        }
    }
}
