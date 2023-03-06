module.exports = async ({deployments: { deploy }, ethers: { getNamedSigners, getContract }}) => {
	const { deployer } = await getNamedSigners();

	await deploy("Amatik", {
		from: deployer.address,
		contract: "Amatik",
		// TODO fix
		args: ["0x193aADCe91b8398287FBC5AE481bd87596AD01Fb", "0xF62c7Fd606C9322Ee06eFf5B664111096B9BFD7C"],
		log: true,
	});

	const amatik = await getContract("Amatik");

	return [amatik];
};

module.exports.tags = ["Amatik", "prod"];
