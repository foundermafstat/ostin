import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

const config = new AptosConfig({
  network: Network.TESTNET,
})

export const aptosClient = new Aptos(config)

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xb072ec1cffe2cf7888420e00bdcbef08eea61ce639924246218b3a3d84623217'
export const MODULE_NAME = 'portfolio_coach'

export const CONTRACT_MODULE = `${CONTRACT_ADDRESS}::${MODULE_NAME}`
