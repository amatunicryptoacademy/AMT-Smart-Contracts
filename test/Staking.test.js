const { expect } = require("chai");
const { BigNumber } = require("ethers");
const {
	ethers: {
		getContract,
		getNamedSigners,
		utils: { parseEther },
		constants
	},
	deployments: { fixture, createFixture },
	timeAndMine,
} = require("hardhat");

const setupFixture = createFixture(async () => {
	await fixture(["", "dev"]);

	const amatik = await getContract("Amatik");
	const staking = await getContract("Staking");

	return [amatik, staking];
});

describe("Staking", function () {
	let deployer, caller, amatik, staking;

	before("Before All: ", async function () {
		({ deployer, caller } = await getNamedSigners());
	});

	beforeEach(async function () {
		[amatik, staking] = await setupFixture();
		await amatik.transfer(caller.address, parseEther("1000"));
	});

	describe("Initialization: ", function () {
		it("Should initialize with correct values", async function () {
			expect(await staking.token()).to.equal(amatik.address);
			expect(await staking.availablePrizeFund()).to.equal(constants.Zero);
			expect(await staking.BLOCKS_PER_YEAR()).to.equal(30);
		});
	});

	describe("addPrizeFund function: ", function () {
		it("Should add prize fund", async function () {
			const tokenBalance = await amatik.balanceOf(deployer.address);
			await amatik.approve(staking.address, parseEther("1000"));
			await staking.addPrizeFund(parseEther("1000"));
			expect(await staking.availablePrizeFund()).to.equal(parseEther("1000"));
			expect(await amatik.balanceOf(deployer.address)).to.equal(tokenBalance.sub(parseEther("1000")));
		});
	});
	describe("Stake function", function () {
		it("Should stake tokens", async function () {
			await amatik.approve(staking.address, parseEther("1000"));
			await staking.addPrizeFund(parseEther("1000"));
			const tx = await staking.stake(parseEther("100"));
			expect(await staking.availablePrizeFund()).to.equal(
				parseEther("1000").sub(parseEther("100").mul(12).div(100))
			);
			expect(await staking.userInfo(deployer.address, 0)).to.eql([
				parseEther("100"),
				BigNumber.from(tx.blockNumber)
			]);
		});
		it("Should emit event staked", async function () {
			await amatik.approve(staking.address, parseEther("1000"));
			const tx = await staking.addPrizeFund(parseEther("1000"));
			await expect(staking.stake(parseEther("100")))
				.to.emit(staking, "Staked")
				.withArgs(deployer.address, parseEther("100"), tx.blockNumber + 1);
		});
		it("Should revert if availablePrizeFund iz 0", async function () {
			await expect(staking.stake(parseEther("100"))).to.be.revertedWith("Staking: Insufficient Prize fund");
		});
	});
	describe("Unstake function", function () {
		it("Should unstake", async function () {
			await amatik.approve(staking.address, parseEther("1000"));
			await staking.addPrizeFund(parseEther("1000"));
			await staking.stake(parseEther("100"));
			const tokenBalance = await amatik.balanceOf(deployer.address);
			await timeAndMine.mine(150);
			await staking.unstake(0);
			expect(await amatik.balanceOf(deployer.address)).to.equal(
				tokenBalance.add(parseEther("100")).add(parseEther("100").mul(12).div(100))
			);
		});
		it("Should emit Unstaked", async function () {
			await amatik.approve(staking.address, parseEther("1000"));
			await staking.addPrizeFund(parseEther("1000"));
			await staking.stake(parseEther("100"));
			await timeAndMine.mine(150);
			await expect(staking.unstake(0)).to.emit(staking, "Unstaked").withArgs(deployer.address, parseEther("112"));
		});
		it.only("Should revert with 'Staking: Nothing to unstake'", async function () {
			await amatik.approve(staking.address, parseEther("1000"));
			await staking.addPrizeFund(parseEther("1000"));
			await staking.stake(parseEther("100"));
			await timeAndMine.mine(150);
			await staking.unstake(0);
			console.log(await staking.userInfo(deployer.address));
			await expect(staking.unstake(0)).to.be.revertedWith("Staking: Nothing to unstake");
		});
		it("Should revert with 'Staking: Locked period didn't passed'", async function () {
			await amatik.approve(staking.address, parseEther("1000"));
			await staking.addPrizeFund(parseEther("1000"));
			await staking.stake(parseEther("100"));
			await expect(staking.unstake(0)).to.be.revertedWith("Staking: Locked period didn't passed");
		});
	});

	describe("Withdraw function", function () {
		it("Should withdraw assets", async function () {
			await amatik.approve(staking.address, parseEther("1000"));
			await staking.addPrizeFund(parseEther("1000"));
			const tokenBalance = await amatik.balanceOf(deployer.address);
			await staking.connect(caller).stake(parseEther("1000"));
			await staking.withdraw();
			expect(await amatik.balanceOf(deployer.address)).to.equal(
				tokenBalance.add(parseEther("1000").sub(parseEther("120")))
			);
			expect(await staking.availablePrizeFund()).to.equal(constants.Zero);
		});
	});
});
