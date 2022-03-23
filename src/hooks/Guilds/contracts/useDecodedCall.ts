import { utils } from 'ethers';
import { RegistryContract, useContractRegistry } from './useContractRegistry';
import ERC20ABI from '../../../abis/ERC20.json';
import { useWeb3React } from '@web3-react/core';
import { Call } from 'components/Guilds/CreateProposalPage';
import { SupportedAction } from 'components/Guilds/ActionsBuilder/SupportedActions';

const ERC20_TRANSFER_SIGNATURE = '0xa9059cbb';
const ERC20_APPROVE_SIGNATURE = '0x095ea7b3';

const knownSigHashes: Record<string, { callType: SupportedAction; ABI: any }> =
  {
    [ERC20_TRANSFER_SIGNATURE]: {
      callType: SupportedAction.ERC20_TRANSFER,
      ABI: ERC20ABI,
    },
    [ERC20_APPROVE_SIGNATURE]: {
      callType: SupportedAction.GENERIC_CALL,
      ABI: ERC20ABI,
    },
  };

export interface DecodedCall {
  callType: SupportedAction;
  function: utils.FunctionFragment;
  args: utils.Result;
}

const decodeCallUsingEthersInterface = (
  data: string,
  contractInterface: utils.Interface,
  callType?: SupportedAction
): DecodedCall => {
  // Get the first 10 characters of Tx data, which is the Function Selector (SigHash).
  const sigHash = data.substring(0, 10);

  // Find the ABI function fragment for the sighash.
  const functionFragment = contractInterface.getFunction(sigHash);
  if (!functionFragment) return null;

  // Decode the function parameters.
  const params = contractInterface.decodeFunctionData(functionFragment, data);
  return {
    callType: callType || SupportedAction.GENERIC_CALL,
    function: functionFragment,
    args: params,
  };
};

const getContractInterfaceFromRegistryContract = (
  registryContract: RegistryContract
) => {
  // Construct the interface for the contract.
  const contractInterface = new utils.Interface(
    registryContract.functions.map(f => {
      const name = f.functionName;
      const params = f.params.reduce(
        (acc, cur) => acc.concat(`${cur.type} ${cur.name}`),
        ''
      );
      return `function ${name}(${params})`;
    })
  );

  return { contractInterface, callType: SupportedAction.GENERIC_CALL };
};

const getContractFromKnownSighashes = (data: string) => {
  // Get the first 10 characters of Tx data, which is the Function Selector (SigHash).
  const sigHash = data.substring(0, 10);

  // Heuristic detection using known sighashes
  const match = knownSigHashes[sigHash];
  let contractInterface = new utils.Interface(match.ABI);
  return {
    contractInterface,
    callType: match.callType,
  };
};

export const useDecodedCall = ({ to, data }: Call) => {
  const { chainId } = useWeb3React();

  let decodedCall: DecodedCall = null;

  // Detect using the Guild calls registry.
  const { contracts } = useContractRegistry();
  const matchedContract = contracts?.find(
    contract => contract.networks[chainId] === to
  );
  const { callType, contractInterface } = matchedContract
    ? getContractInterfaceFromRegistryContract(matchedContract)
    : getContractFromKnownSighashes(data);

  if (!contractInterface) return null;

  decodedCall = decodeCallUsingEthersInterface(
    data,
    contractInterface,
    callType
  );

  return {
    contract: contractInterface,
    decodedCall,
  };
};
