--[[
	KEYS[1]: set key,

	ARGV[1]: score,
	ARGV[2]: member,
	ARGV[3]: min score,
	ARGV[4]: max score,
]]
local ratings = redis.call('zrangebyscore', KEYS[1], ARGV[3], ARGV[4])
local rating = tonumber(ARGV[2])
for k, v in pairs(ratings) do
	rating = rating + tonumber(v)
end

redis.call('zadd', KEYS[1], ARGV[1], ARGV[2])
return tostring(rating)
