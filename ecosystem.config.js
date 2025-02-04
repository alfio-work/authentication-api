module.exports = {
	apps: [
		{
			name: "api",
			script: "npm",
			args: "start",
			watch: true,
			ignore_watch: [
				"[\/\\]\./",
				"node_modules",
				"public",
				"docker-compose.yml",
				".gitlab",
				".git"
			],
			out_file: "../api.log",
			log_date_format: "YYYY-MM-DD HH:mm"
		}
	]
}
