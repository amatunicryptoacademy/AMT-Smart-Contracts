module.exports = async ({deployments: { deploy }, ethers: { getNamedSigners, getContract }}) => {
	const { deployer } = await getNamedSigners();

	try {
		await deploy("BurnReserve", {
			from: deployer.address,
			contract: "BurnReserve",
			args: [],
			log: true,
		});
	} catch (error) {
		throw error.message;
	}

	const burnReserve = await getContract("BurnReserve");

	return burnReserve;
};

module.exports.tags = ["BurnReserve", "stage"];
