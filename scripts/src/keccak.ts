import { utils } from 'ethers';

const abi = new utils.Interface([
  'function approve(address _approved, uint256 _tokenId) external payable',
  'function setApprovalForAll(address _operator, bool _approved) external',
]);

console.log(abi.getFunction('setApprovalForAll'));
console.log(abi.getSighash('setApprovalForAll'));
