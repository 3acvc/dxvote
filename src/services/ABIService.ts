import { Interface } from 'ethers/utils';
import RootContext from '../contexts';

export const schema = {
  Avatar: require('../contracts/DxAvatar').abi,
  Controller: require('../contracts/DxController').abi,
  VotingMachine: require('../contracts/GenesisProtocol').abi,
  DXDVotingMachine: require('../contracts/DXDVotingMachine').abi,
  Reputation: require('../contracts/DxReputation').abi,
  WalletScheme: require('../contracts/WalletScheme').abi,
  ERC20: require('../contracts/ERC20').abi,
  PermissionRegistry: require('../contracts/PermissionRegistry').abi,
  Multicall: require('../contracts/Multicall').abi,
};

export default class ABIService {
  context: RootContext;

  constructor(context: RootContext) {
    this.context = context;
  }
  
  getAbi(contractType: string) {
    return schema[contractType];
  }
  
  decodeCall(contractType: string, data: string) {
    const { providerStore } = this.context;

    const { library } = providerStore.getActiveWeb3React();

    const contractInterface = new Interface(this.getAbi(contractType));
    const functionSignature = data.substring(0,10);
    for (const functionName in contractInterface.functions) {
      if (contractInterface.functions[functionName].sighash === functionSignature){
        return {
          function: contractInterface.functions[functionName],
          args: library.eth.abi.decodeParameters(
            contractInterface.functions[functionName].inputs.map((input) => {return input.type}), data.substring(10)
          )
        }
      }
    }
    return undefined;
  }
}
