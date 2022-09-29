import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const {root} = await getNamedAccounts();

	const contract = await deploy('ERC20', {
		from: root,
		args: ['Staking Token', 'STT'],
		log: true,
		autoMine: true
	});

	console.log("ERC20 token deployed at: "+ contract.address);
};

export default func;
func.tags = ['ERC20'];