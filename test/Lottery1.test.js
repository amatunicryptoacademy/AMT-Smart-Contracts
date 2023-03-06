const { expect } = require("chai");
const { BigNumber } = require("ethers");
const {
	ethers: {
		getContract,
		getNamedSigners,
		utils: { parseEther }
	},
	deployments: { fixture, createFixture },
	ethers,
} = require("hardhat");

const setupFixture = createFixture(async () => {
	await fixture(["", "dev"]);
	const lottery = await getContract("Lottery");
	const amatik = await getContract("Amatik");
	const generator = await getContract("RandomNumberGenerator");
	await lottery.setRendomGenerator(generator.address);

	return [lottery, amatik];
});

describe("Lottery", function () {
	let deployer, caller, vzgo, grno, lottery, amatik, amount;

	before("Before All: ", async function () {
		({ deployer, vzgo, caller, grno } = await getNamedSigners());
	});

	beforeEach(async function () {
		[lottery, amatik] = await setupFixture();
		// await network.provider.request({
		// 	method: "hardhat_impersonateAccount",
		// 	params: ["0x907cEc57456ADb5484921771d692a74c2Dd0d107"]
		// });
		// signer = await ethers.getSigner("0x907cEc57456ADb5484921771d692a74c2Dd0d107");
		// await amatik.connect(signer).transfer(deployer.address, parseEther("10000"));
		// await network.provider.request({
		// 	method: "hardhat_stopImpersonatingAccount",
		// 	params: ["0x907cEc57456ADb5484921771d692a74c2Dd0d107"]
		// });
		await amatik.transfer(caller.address, parseEther("3000"));
		await amatik.transfer(vzgo.address, parseEther("1000"));
		await amatik.transfer(grno.address, parseEther("1000"));
	});

	describe("Initialization: ", function () {
		it("Should initialize with correct values", async function () {
			// expect(await lottery.token()).to.equal("0xE8EbCf4Fd1faa9B77c0ec0B26e7Cc32a251Cd799");
			const blockNumber = await ethers.provider.getBlockNumber();
			await lottery.createNewLotto([1000, 2000, 2000], blockNumber + 5, 5, 10);
			await lottery.drawWinningNumbers(1);
		});
	});

	xdescribe("Create new lotto", function () {
		it("Should create new lotto", async function () {
			const blockNumber = await ethers.provider.getBlockNumber();
			await lottery.createNewLotto([1000, 2000, 2000], blockNumber + 5, 5, 10);
			expect(await lottery.getBasicLottoInfo(1)).to.eql([
				BigNumber.from(1),
				0,
				[1000, 2000, 2000],
				BigNumber.from(blockNumber).add(5),
				BigNumber.from(5),
				10,
				0,
				[]
			]);
		});
		it("Should create new lotto with Status open", async function () {
			const blockNumber = await ethers.provider.getBlockNumber();
			await lottery.createNewLotto([1000, 2000, 2000], blockNumber + 1, 5, 10);
			expect(await lottery.getBasicLottoInfo(1)).to.eql([
				BigNumber.from(1),
				1,
				[1000, 2000, 2000],
				BigNumber.from(blockNumber).add(1),
				BigNumber.from(5),
				10,
				0,
				[]
			]);
		});
		it("Should revert with 'Lottery: Ticket price can't be zero'", async function () {
			const blockNumber = await ethers.provider.getBlockNumber();
			await expect(lottery.createNewLotto([1000, 2000, 2000], blockNumber + 5, 0, 10)).to.be.revertedWith(
				"Lottery: Ticket price can't be zero"
			);
		});
		it("Should revert with 'Lottery: Tickets count can't be zero'", async function () {
			const blockNumber = await ethers.provider.getBlockNumber();
			await expect(lottery.createNewLotto([1000, 2000, 2000], blockNumber + 5, 5, 0)).to.be.revertedWith(
				"Lottery: Tickets count can't be zero"
			);
		});
		it("Should revert with 'Lottery: Too late'", async function () {
			const blockNumber = await ethers.provider.getBlockNumber();
			await expect(lottery.createNewLotto([1000, 2000, 2000], blockNumber - 5, 5, 10)).to.be.revertedWith(
				"Lottery: Too late"
			);
		});
		it("Should revert with 'Lottery: Incorrect percents for prize distribution'", async function () {
			const blockNumber = await ethers.provider.getBlockNumber();
			await expect(lottery.createNewLotto([1000, 2000, 1000], blockNumber + 5, 5, 10)).to.be.revertedWith(
				"Lottery: Incorrect percents for prize distribution"
			);
		});
	});

	xdescribe("Buy Tickets", function () {
		beforeEach("Befor each", async function () {
			amount = parseEther((await lottery.getTokenAmountForCurrentPrice(50)).toString());
		});
		it("Should buy ticket", async function () {
			const tokenBalance = await amatik.balanceOf(deployer.address);
			const blockNumber = await ethers.provider.getBlockNumber();
			await lottery.createNewLotto([1000, 2000, 2000], blockNumber + 1, 50, 10);
			await amatik.approve(lottery.address, amount);
			await lottery.buyTicket(1);
			expect((await lottery.getBasicLottoInfo(1)).ticketsSold).to.equal(1);
			expect(await lottery.getUsersTickets(deployer.address, 1)).to.eql([1]);
			expect(await lottery.currentTicket(1)).to.equal(2);
			expect(await amatik.balanceOf(deployer.address)).to.equal(tokenBalance.sub(amount));
			expect(await amatik.balanceOf(lottery.address)).to.equal(amount);
		});
		it("Should revert if all tickets are sold", async function () {
			const blockNumber = await ethers.provider.getBlockNumber();
			await lottery.createNewLotto([1000, 2000, 2000], blockNumber + 1, 50, 1);
			await amatik.approve(lottery.address, amount);
			await lottery.buyTicket(1);
			await expect(lottery.buyTicket(1)).to.be.revertedWith("Lottery: No available tickets");
		});
		it("Should revert if lottery doesn't started", async function () {
			const blockNumber = await ethers.provider.getBlockNumber();
			await lottery.createNewLotto([1000, 2000, 2000], blockNumber + 100, 50, 1);
			await amatik.approve(lottery.address, amount);
			await expect(lottery.buyTicket(1)).to.be.revertedWith("Lottery: Not started yet");
		});
	});
	xdescribe("End of lottery", function () {
		it("Should buy tickets and claim the reward", async function () {
			amount = await lottery.getTokenAmountForCurrentPrice(50);
			const blockNumber = await ethers.provider.getBlockNumber();
			await lottery.createNewLotto([3000, 1500, 500], blockNumber + 1, 50, 9);
			await amatik.approve(lottery.address, parseEther("5000"));
			await amatik.connect(caller).approve(lottery.address, parseEther("5000"));
			await amatik.connect(vzgo).approve(lottery.address, parseEther("5000"));
			await amatik.connect(grno).approve(lottery.address, parseEther("5000"));
			for (let i = 1; i < 5; i++) {
				await lottery.buyTicket(1);
			}
			for (let i = 5; i < 7; i++) {
				await lottery.connect(caller).buyTicket(1);
			}
			await lottery.connect(vzgo).buyTicket(1);
			await lottery.connect(vzgo).buyTicket(1);
			await lottery.connect(grno).buyTicket(1);
			// Should revert if the user tries to claim befor numbers are drawn
			await expect(lottery.claimReward(1)).to.be.revertedWith("Lottery: Winning Numbers not chosen yet");
			await lottery.drawWinningNumbers(1);

			const prizeAmount = 9 * amount;
			const deployerTokenBalance = await amatik.balanceOf(deployer.address);
			const callerTokenBalance = await amatik.balanceOf(caller.address);
			const vzgoTokenBalance = await amatik.balanceOf(vzgo.address);
			const prizeForFirstPlace = parseEther(prizeAmount.toString()).mul(30).div(100);
			const prizeForSecondPlace = parseEther(prizeAmount.toString()).mul(15).div(100);
			const prizeForThirdPlace = parseEther(prizeAmount.toString()).mul(5).div(100);

			await lottery.claimReward(1);
			await lottery.connect(caller).claimReward(1);
			await lottery.connect(vzgo).claimReward(1);
			// Should revert nothing to claim
			await expect(lottery.connect(grno).claimReward(1)).to.be.revertedWith("Lottery: Nothing to claim");

			expect(await amatik.balanceOf(deployer.address)).to.equal(deployerTokenBalance.add(prizeForFirstPlace));
			expect(await amatik.balanceOf(caller.address)).to.equal(callerTokenBalance.add(prizeForSecondPlace));
			expect(await amatik.balanceOf(vzgo.address)).to.equal(vzgoTokenBalance.add(prizeForThirdPlace));
			expect(await lottery.alreadyClaimed(deployer.address, 1)).to.equal(true);

			// Should revert if the user tries to claim again
			await expect(lottery.claimReward(1)).to.be.revertedWith("Lottery: User have already claimed his rewards");
		});
	});
});
