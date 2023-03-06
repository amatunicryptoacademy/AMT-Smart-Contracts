const { expect } = require("chai");
const {
	ethers: {
		getContract,
		getNamedSigners,
		utils: { parseEther },
		constants
	},
	deployments: { fixture, createFixture }
} = require("hardhat");

const setupFixture = createFixture(async () => {
	await fixture(["", "dev"]);

	const amatik = await getContract("Amatik");
	const burnReserve = await getContract("BurnReserve");

	return [amatik, burnReserve];
});

describe("Amatik Token", function () {
	let caller, amatik, burnReserve;

	before("Before All: ", async function () {
		({ caller } = await getNamedSigners());
	});

	beforeEach(async function () {
		[amatik, burnReserve] = await setupFixture();
	});

	describe("Initialization: ", function () {
		it("Should initialize with correct values", async function () {
			expect(await amatik.totalSupply()).to.equal(parseEther("200000000"));
			expect(await amatik.name()).to.equal("Amatik");
			expect(await amatik.symbol()).to.equal("AMT");
			expect(await amatik.decimals()).to.equal(18);
		});
	});

	describe("Burn function: ", function () {
		it("Should burn given amount of amatik tokens from BurnReserve", async function () {
			await amatik.transfer(burnReserve.address, parseEther("100"));
			await amatik.burn();
			expect(await amatik.totalSupply()).to.equal(parseEther("200000000").sub(parseEther("100")));
			expect(await amatik.balanceOf(burnReserve.address)).to.equal(constants.Zero);
		});

		it("Should revert with 'Ownable: caller is not the owner'", async function () {
			await amatik.transfer(burnReserve.address, parseEther("100"));
			await expect(amatik.connect(caller).burn()).to.be.revertedWith(
				"Ownable: caller is not the owner"
			);
		});
	});
});
