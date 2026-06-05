using Microsoft.EntityFrameworkCore;

namespace FarmApi.Services
{
    public class FarmDbContext: DbContext
    {
        public FarmDbContext(DbContextOptions<FarmDbContext> options)
        : base(options)
        {
        }

        // Only needed if you map result sets
        //public DbSet<Farmer> Farmers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //modelBuilder.Entity<ContractResultDto>().HasNoKey();
        }
    }
}
