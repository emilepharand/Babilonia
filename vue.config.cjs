module.exports = {
	configureWebpack: {
		// Before this there were errors in the console
		// It slows down build but for this application it does not matter
		devtool: "eval-cheap-source-map"
	}
}
