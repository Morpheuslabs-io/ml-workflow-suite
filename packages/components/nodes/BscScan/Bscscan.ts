import { ICommonObject, INode, INodeData, INodeExecutionData, INodeParams, NodeType } from '../../src/Interface'
import { handleErrorMessage, returnNodeExecutionData, serializeQueryParams } from '../../src/utils'
import { NETWORK, NETWORK_LABEL } from '../../src/ChainNetwork'
import axios, { AxiosRequestConfig, Method } from 'axios'
class Bscscan implements INode {
    label: string
    name: string
    type: NodeType
    description: string
    version: number
    icon: string
    incoming: number
    outgoing: number
    actions: INodeParams[]
    credentials?: INodeParams[]
    networks?: INodeParams[]
    inputParameters?: INodeParams[]

    constructor() {
        this.label = 'Bscscan'
        this.name = 'bscscan'
        this.icon = 'bscscan-logo-circle.svg'
        this.type = 'action'
        this.version = 1.0
        this.description = 'Perform Bscscan operations'
        this.incoming = 1
        this.outgoing = 1
        this.actions = [
            {
                label: 'API',
                name: 'api',
                type: 'options',
                options: [
                    {
                        label: 'Get BNB Balance for a Single Address',
                        name: 'getBNBBalance',
                        description: 'Returns the BNB balance of a given address.'
                    },
                    {
                        label: 'Get BNB Balance for Multiple Addresses in a Single Call(separated by a comma)',
                        name: 'getBNBBalanceMulti',
                        description: 'Returns the balance of the accounts from a list of addresses.'
                    },
                    {
                        label: 'Get Contract ABI for Verified Contract Source Codes',
                        name: 'getContractABI',
                        description: 'Returns the Contract Application Binary Interface ( ABI ) of a verified smart contract.'
                    },
                    {
                        label: 'Get Contract Source Code for Verified Contract Source Codes',
                        name: 'getContractSourceCode',
                        description: 'Returns the Solidity source code of a verified smart contract'
                    },
                    {
                        label: 'Get Contract Creator and Creation Tx Hash',
                        name: 'getContractCreatorTxHash',
                        description:
                            "Returns a contract's deployer address and transaction hash it was created, up to 5 at a time(addresses entered in one line , each separated by a comma)."
                    },

                    {
                        label: 'Check Transaction Receipt Status',
                        name: 'getTxReceiptStatus',
                        description: 'Returns the status code of a transaction execution.'
                    }
                ],

                default: 'getBNBBalance'
            }
        ] as INodeParams[]
        this.networks = [
            {
                label: 'Network',
                name: 'network',
                type: 'options',
                options: [
                    {
                        label: NETWORK_LABEL.BSC,
                        name: NETWORK.BSC
                    },
                    {
                        label: NETWORK_LABEL.BSC_TESTNET,
                        name: NETWORK.BSC_TESTNET
                    }
                ],
                default: 'homestead'
            }
        ] as INodeParams[]
        this.credentials = [
            {
                label: 'Credential Method',
                name: 'credentialMethod',
                type: 'options',
                options: [
                    {
                        label: 'BscScan API Key',
                        name: 'bscscanApi'
                    }
                ],
                default: 'bscscanApi'
            }
        ] as INodeParams[]
        this.inputParameters = [
            {
                label: 'Address',
                name: 'address',
                type: 'string',
                description: 'The address parameter(s) required',
                show: {
                    'actions.api': [
                        'getBNBBalance',
                        'getBNBBalanceMulti',
                        'getContractCreatorTxHash',
                        'getContractABI',
                        'getContractSourceCode'
                    ]
                }
            },
            {
                label: 'TxHash',
                name: 'txhash',
                type: 'string',
                description: 'The txhash required',
                show: {
                    'actions.api': ['getTxReceiptStatus']
                }
            }
        ] as INodeParams[]
    }
    async run(nodeData: INodeData): Promise<INodeExecutionData[] | null> {
        const actionData = nodeData.actions
        const networksData = nodeData.networks
        const inputParametersData = nodeData.inputParameters
        const credentials = nodeData.credentials
        if (actionData === undefined || inputParametersData === undefined || credentials === undefined || networksData === undefined) {
            throw new Error('Required data missing')
        }
        // GET api
        const api = actionData.api as string

        // GET network
        const network = networksData.network as NETWORK
        // GET credentials
        const apiKey = credentials.apiKey as string

        // GET address
        const address = inputParametersData.address as string
        const txhash = inputParametersData.txhash as string
        const returnData: ICommonObject[] = []
        let responseData: any
        if (api === 'getBNBBalance') {
            try {
                const queryParameters = {
                    module: 'account',
                    action: 'balance',
                    address,
                    tag: 'latest',
                    apikey: apiKey
                }
                let url = ''
                // Change url depending on network. See https://docs.etherscan.io/getting-started/endpoint-urls
                if (network === NETWORK.BSC) {
                    url = 'https://api.bscscan.com/api'
                } else if (network === NETWORK.BSC_TESTNET) {
                    url = 'https://api-testnet.bscscan.com/api'
                }
                const axiosConfig: AxiosRequestConfig = {
                    method: 'GET' as Method,
                    url,
                    params: queryParameters,
                    paramsSerializer: (params) => serializeQueryParams(params),
                    headers: { 'Content-Type': 'application/json' }
                }
                const response = await axios(axiosConfig)
                responseData = response.data
            } catch (error) {
                throw handleErrorMessage(error)
            }
            if (Array.isArray(responseData)) returnData.push(...responseData)
            else returnData.push(responseData)

            return returnNodeExecutionData(returnData)
        } else if (api === 'getBNBBalanceMulti') {
            try {
                const queryParameters = {
                    module: 'account',
                    action: 'balancemulti',
                    address,
                    tag: 'latest',
                    apikey: apiKey
                }
                let url = ''
                if (network === NETWORK.BSC) {
                    url = 'https://api.bscscan.com/api'
                } else if (network === NETWORK.BSC_TESTNET) {
                    url = 'https://api-testnet.bscscan.com/api'
                }
                const axiosConfig: AxiosRequestConfig = {
                    method: 'GET' as Method,
                    url,
                    params: queryParameters,
                    paramsSerializer: (params) => serializeQueryParams(params),
                    headers: { 'Content-Type': 'application/json' }
                }
                const response = await axios(axiosConfig)
                responseData = response.data
            } catch (error) {
                throw handleErrorMessage(error)
            }
            if (Array.isArray(responseData)) returnData.push(...responseData)
            else returnData.push(responseData)

            return returnNodeExecutionData(returnData)
        } else if (api === 'getContractABI') {
            try {
                const queryParameters = {
                    module: 'contract',
                    action: 'getabi',
                    address,
                    apikey: apiKey
                }
                let url = ''
                if (network === NETWORK.BSC) {
                    url = 'https://api.bscscan.com/api'
                } else if (network === NETWORK.BSC_TESTNET) {
                    url = 'https://api-testnet.bscscan.com/api'
                }
                const axiosConfig: AxiosRequestConfig = {
                    method: 'GET' as Method,
                    url,
                    params: queryParameters,
                    paramsSerializer: (params) => serializeQueryParams(params),
                    headers: { 'Content-Type': 'application/json' }
                }
                const response = await axios(axiosConfig)
                responseData = response.data
            } catch (error) {
                throw handleErrorMessage(error)
            }
            if (Array.isArray(responseData)) returnData.push(...responseData)
            else returnData.push(responseData)

            return returnNodeExecutionData(returnData)
        } else if (api === 'getContractSourceCode') {
            try {
                const queryParameters = {
                    module: 'contract',
                    action: 'getsourcecode',
                    address,
                    apikey: apiKey
                }
                let url = ''

                if (network === NETWORK.BSC) {
                    url = 'https://api.bscscan.com/api'
                } else if (network === NETWORK.BSC_TESTNET) {
                    url = 'https://api-testnet.bscscan.com/api'
                }
                const axiosConfig: AxiosRequestConfig = {
                    method: 'GET' as Method,
                    url,
                    params: queryParameters,
                    paramsSerializer: (params) => serializeQueryParams(params),
                    headers: { 'Content-Type': 'application/json' }
                }
                const response = await axios(axiosConfig)
                responseData = response.data
            } catch (error) {
                throw handleErrorMessage(error)
            }
            if (Array.isArray(responseData)) returnData.push(...responseData)
            else returnData.push(responseData)

            return returnNodeExecutionData(returnData)
        } else if (api === 'getContractCreatorTxHash') {
            try {
                const queryParameters = {
                    module: 'contract',
                    action: 'getcontractcreation',
                    contractaddresses: address,
                    apikey: apiKey
                }
                let url = ''
                if (network === NETWORK.BSC) {
                    url = 'https://api.bscscan.com/api'
                } else if (network === NETWORK.BSC_TESTNET) {
                    url = 'https://api-testnet.bscscan.com/api'
                }
                const axiosConfig: AxiosRequestConfig = {
                    method: 'GET' as Method,
                    url,
                    params: queryParameters,
                    paramsSerializer: (params) => serializeQueryParams(params),
                    headers: { 'Content-Type': 'application/json' }
                }
                const response = await axios(axiosConfig)
                responseData = response.data
            } catch (error) {
                throw handleErrorMessage(error)
            }
            if (Array.isArray(responseData)) returnData.push(...responseData)
            else returnData.push(responseData)

            return returnNodeExecutionData(returnData)
        } else if (api === 'getTxReceiptStatus') {
            try {
                const queryParameters = {
                    module: 'transaction',
                    action: 'gettxreceiptstatus',
                    txhash,
                    apikey: apiKey
                }
                let url = ''
                if (network === NETWORK.BSC) {
                    url = 'https://api.bscscan.com/api'
                } else if (network === NETWORK.BSC_TESTNET) {
                    url = 'https://api-testnet.bscscan.com/api'
                }
                const axiosConfig: AxiosRequestConfig = {
                    method: 'GET' as Method,
                    url,
                    params: queryParameters,
                    paramsSerializer: (params) => serializeQueryParams(params),
                    headers: { 'Content-Type': 'application/json' }
                }
                const response = await axios(axiosConfig)
                responseData = response.data
            } catch (error) {
                throw handleErrorMessage(error)
            }
            if (Array.isArray(responseData)) returnData.push(...responseData)
            else returnData.push(responseData)

            return returnNodeExecutionData(returnData)
        }
        return returnNodeExecutionData(returnData)
    }
}
module.exports = { nodeClass: Bscscan }
