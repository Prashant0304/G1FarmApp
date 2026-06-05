namespace FarmApi.Services
{
    using Dapper;
    using System.Data;
    using Microsoft.Data.SqlClient;
    public class DbService
    {
        private readonly IConfiguration _config;

        public DbService(IConfiguration config)
        {
            _config = config;
        }

        private IDbConnection CreateConnection()
            => new SqlConnection(_config.GetConnectionString("DefaultConnection"));

        public async Task<IEnumerable<T>> QueryAsync<T>(string sp, object param = null)
        {
            using var conn = CreateConnection();
            return await conn.QueryAsync<T>(sp, param, commandType: CommandType.StoredProcedure);
        }

        public async Task<(IEnumerable<T>, long)> QueryPagedAsync<T>(string sp, object param)
        {
            using var conn = CreateConnection();
            using var multi = await conn.QueryMultipleAsync(sp, param, commandType: CommandType.StoredProcedure);

            var data = await multi.ReadAsync<T>();
            var total = await multi.ReadFirstAsync<long>();

            return (data, total);
        }

        public async Task<int> ExecuteAsync(string sp, object param)
        {
            using var conn = CreateConnection();

            return await conn.ExecuteAsync(
                sp,
                param,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<T> QuerySingleAsync<T>(string sp, object param = null)
        {
            using var conn = CreateConnection();
            return await conn.QuerySingleAsync<T>(
                sp,
                param,
                commandType: CommandType.StoredProcedure
            );
        }
    }
}
