import create from 'zustand';
import produce from 'immer';
import { FC } from 'react';
import {
  BeepleDescription,
  CryptoPunkDescription,
  EulerBeatsDescription,
} from '../data/descriptions';

export type CollectionDisplayType = 'carousel' | 'grid';

export type CollectionType = 'curation' | 'live feed' | 'minted' | 'saved';

export type CollectionMetadata = {
  name: string;
  description: string | FC;
  seoName?: string;
  isLiveCollection?: boolean;
  initialBackgroundHash?: string;
  displayType: CollectionDisplayType;
  type?: CollectionType;
};

export type CollectionMetadataMap = { [id: string]: CollectionMetadata };

export const COLLECTION_METADATA_MAP: CollectionMetadataMap = {
  // live in prod
  'account': {
    name: 'Collection',
    description: 'SIZE artworks',
    displayType: 'grid',
  },
  'saga-latest-minted': {
    name: 'Latest Minted',
    description: `Browse the latest minted $HASH artwork in the SAGA season.`,
    displayType: 'carousel',
    initialBackgroundHash:
      '0x7bef593b6a7fb9f4bbb21303050c3005a87a427b763267263e700eb105dfb1de',
    type: 'live feed',
  },
  'genesis-latest-minted': {
    name: 'S0: Genesis',
    description: `Browse the GENESIS collection`,
    displayType: 'carousel',
    initialBackgroundHash:
      '0xf0c2a725c0bc43519f7d49e812b4ba453293bc505ac0136476faf470b567020b',
    type: 'live feed',
  },
  'uniswap': {
    name: 'Uniswap portraits',
    description: 'P I N K',
    initialBackgroundHash:
      '0x71034ee8951adb7856def61b7a2ce419c3b6489d41cf086dbabde3789e7c4536',
    isLiveCollection: true,
    displayType: 'carousel',
    type: 'live feed',
  },
  'gas-station': {
    name: 'Gas Station',
    description:
      'Browse the latest transactions globally with unusually high or low fees.',
    initialBackgroundHash:
      '0x7bef593b6a7fb9f4bbb21303050c3005a87a427b763267263e700eb105dfb1de',
    isLiveCollection: true,
    displayType: 'carousel',
    type: 'live feed',
  },
  'cryptopunk-aliens': {
    name: 'CryptoPunk Aliens',
    description: CryptoPunkDescription,
    initialBackgroundHash:
      '0x90cd2007ffc1b65aea3f6083b7cbae318a01fdadc87bbafa5673daff8d698682',
    isLiveCollection: false,
    displayType: 'grid',
    type: 'curation',
  },
  'euler-beats-genesis': {
    name: 'Euler Beats',
    description: EulerBeatsDescription,
    initialBackgroundHash:
      '0xb306ac81f9ff47b8204bdbf747fb9d5ba3fbe4eb1aa3e0f5b6661dfd193dd8f5',
    isLiveCollection: false,
    displayType: 'grid',
    type: 'curation',
  },
  'my-txs': {
    name: 'My Txs',
    description: 'Browse and mint your wallet’s latest transactions.',
    initialBackgroundHash:
      '0x9cd437a4c944527fe7f2e5bd89a1e1de95f7f47aa7760d365106bde5b33222f3',
    isLiveCollection: true,
    type: 'live feed',
    displayType: 'carousel',
  },
  'my-saga': {
    name: '#MySaga',
    description:
      'Browse and mint a curated collection of your wallet’s most memorable moments.',
    initialBackgroundHash:
      '0xaf772b9f05f91d92b33cb5c817c63c147214a879b0eb9b98facd816502df1b31',
    isLiveCollection: true,
    type: 'live feed',
    displayType: 'carousel',
  },
  'my-saga/0xab5801a7d398351b8be11c439e05c5b3259aec9b': {
    name: 'Vitalik in ETH',
    description: 'His moments, in color.',
    initialBackgroundHash:
      '0xeb53c7d5054ac3c4778eeb904b5729eb4adadd26192c5044d5add14f93601193',
    isLiveCollection: true,
    type: 'live feed',
    displayType: 'carousel',
  },
  // 'bookmarks': {
  //   name: 'Bookmarks',
  //   description:
  //     'View your bookmarked $HASH artwork. Purchase unminted transactions or simply enjoy some beautiful mints.',
  //   initialBackgroundHash:
  //     '0x83fd33bc1349ef70fa40508ed97e31757231bddc72f7d7df2e2af6e43784360f',
  //   isLiveCollection: true,
  //   type: 'saved',
  //   displayType: 'carousel',
  // },
  'beeple': {
    name: 'Magic Kingdom',
    description: BeepleDescription,
    initialBackgroundHash:
      '0x581b79faf61086f31480da504afcbc4eb494d7182eaee72f9e23ebad20b6c2a3',
    isLiveCollection: false,
    displayType: 'grid',
    type: 'curation',
  },
};

const INITIAL_COLLECTION_TX_HASHES_MAP: {
  [id: string]: string[];
} = Object.keys(COLLECTION_METADATA_MAP).reduce(
  (a: any, c: any) => ({ ...a, [c]: undefined }),
  {} as any,
);

export const COLLECTION_TX_HASHES_MAP = {
  ...INITIAL_COLLECTION_TX_HASHES_MAP,
  'uniswap': [
    '0x71034ee8951adb7856def61b7a2ce419c3b6489d41cf086dbabde3789e7c4536',
    '0xf1ca0ae3665e7b3b25b735ee63179f8b8264826b40e5ec8865e6b946fc5bea50',
    '0x479cb8c266eeff40200ce93957196300ad052c0ae91445759e458a2f5c2a0cac',
    '0x744c29ef8b3a51797ed61f81237d1e4299aee8101ebe373fc7af8c3f3f1f7717',
  ],
  'cryptopunk-aliens': [
    '0x90cd2007ffc1b65aea3f6083b7cbae318a01fdadc87bbafa5673daff8d698682',
    '0x442d4a85c85ddc1017c9bf0c72c24784fccc69dfac3785e2126961e2f2fd81f9',
    '0xf8d783602dac6c024fa807cd05ff38b8fd96e57804e8fa4cb93ac27c4dfeeb4e',
    '0xa8120de61270bde34e8743298bf26fa88af0847b7c9834ac55bda3af9a9b82ad',
    '0x1b94fd4b2d4fdd4f9d3bbec01bd16437dc60c64a1d9fc452f752cd0e6919f663',
    '0xbdbeffd70460570a3fe7fcc441e2ccace1aa8d61d13a26ed455faf307d83a66f',
    '0x0ddcd60d8955f0d66b3c89f14761f2769bd185d07949ae7838d5d4f10833e5d3',
    '0x156965404ccc76b2d436091cf5730cf34f759c0732cfb57542b645a6237e851c',
    '0x9d4755a3f45bc72e0173e1c668232bd516acc5d9e5fe80e1aca53ba1486e83a7',
  ],
  'test': [
    '0xd2610b0c4a3e870eca26b075edc0fbd02f737481fb96203b32ad21e71cd63523',
    '0x304ddac2188596a085bd71b50494ea83a0f8727161774e63a1e4b46d30744165',
    '0xe4daa77a0de5be96234872cc38fa04682c3d1cc4597e759ca272d12670a991fa',
    '0x8b5f2ad5c596776512c11099d432cd916d036e789918e4fa7d05302125661179',
    '0xba1b526908064ffc014da24d767dbd2aba273e50ce9bc5822ceedb3d9e14cf07',
  ],
  'beeple': [
    '0x581b79faf61086f31480da504afcbc4eb494d7182eaee72f9e23ebad20b6c2a3',
    '0xbf61e2a3a3a28aa0d1364078a63ee3e0dd73cd448eb8e2b728a980b5034257c3',
    '0x3d5aa72ed2d1594220cf623930d844abd51c57801304d5e0abf124e84d6b738b',
    '0xaabc47c2a60f56e7ab1da794679a7ff6d42863b7b60655261dd13151b660595c',
    '0x552b743cae11fd5bf9396ce694c198057b1b9887555164583fe4d3b0bae11bf7',
    '0x4635e4e80d1c8b317399b7b17d2c771e39708e6192a778d90571deb52cc1b93a',
    '0x84760768c527794ede901f97973385bfc1bf2e297f7ed16f523f75412ae772b3',
    '0xc5d6b4556d70af09abbeafa5b0492090a4b0d07e5befdbfca9fe11fe2db88516',
    '0x5237ff9bb7b63dbc727cb2d6b119e81767fc56438e1eeb26ceb48a33f814c87f',
    '0x89b531727b181149a551a9bb6869e1d506a7458cfa1fad0d6b8e9686382c491b',
    '0x714120ad1092adc8ab8e97aa1a4749f63215d2029ba56d308981838f14694dfa',
    '0x71966c51232c2a15659402cb84e868c85d6eb55f82717121c1043996179fb95f',
    '0x6ac7b9abca532f15c312c4d8209b87a107128fba28b532c2edf8456d83440a2f',
    '0x06cc03cc6ca389d1865afaf99d478b7839d9d5926947742d830a8795f648d983',
    '0x37444173109b2c747ba19dd76c9be62543bac001c977dd2f5540f02b9d4c3284',
    '0x8d8015ae63afb9ffbae06ff124b0644c3dc2dc7210c48e908209e96480e8ba5e',
    '0xe62a071a7f2d6cef5ca49b55319760225c587d3b6c497a414d66f15857b89200',
  ],
  'genesis-latest-minted': [
    // All v1 $HASH
    '0x23e3d719fbc025b0a89f20e092214963481802e053b20c54b60b706d3f999268', // 55
    '0x948d5014f89a2215eacfd3e896b73efe134db78c39cadbc131126637716d210f', // 54
    '0xca8f8c315c8b6c48cee0675677b786d1babe726773829a588efa500b71cbdb65', // 53
    '0x2be159ec8b6ef17cb7262e2379efc2d2ad7253cbba0c864189fa6e050418cf94', // 52
    '0xbdab447ba2fd0a493d93635da202ebcfaa309bcc6a22a95d808c93ce8f1c6c2d', // 51
    '0xac139a551bef87eb5a2a43cce659f36830dba7f7f0755e4b6359a9fed2e27482', // 50
    '0x362fd07eb3ee4001cdc92a50027baa2ee424ae93a0978acddf5b6692456538b2', // 49
    '0x559c6389f173736acb90ff6bce72636698cdf7627d62f6b17506f78d00dc3f5b', // 48
    '0xcec1285775fb91ea0d5f32fc4d27fc2f11bc8c8a508cf10b0b0fb34b820b463b', // 47
    '0x84335404c17162119b47fddf56f08e9b1a10a593aa35ad53664a733f935898eb', // 46
    '0x4677a93807b73a0875d3a292eacb450d0af0d6f0eec6f283f8ad927ec539a17b', // 45
    '0x14958e3c5607ef5e97604f79664b2f7c49edbc3753692f52bc926702ccde6c4e', // 44
    '0x14958e3c5607ef5e97604f79664b2f7c49edbc3753692f52bc926702ccde6c4e', // 43
    '0x49dbdf0355bec55f16e211a0b8cfbadc7723b535a025c6c30bda8b62fc1b0996', // 42
    '0xdcc2d338ae2a0154ac0c50b8836fe96e7e8f17a2ccc291dd418467d7022e3aa4', // 41
    '0x9fef127966d59d440c70f28c8e6f1eac3af0d91f94384e207deb3c98ff9c3088', // 40
    '0xfe61b679aeda7a4df824921f54ac9345bdf532f857fc921d84874619b169f588', // 39
    '0xec39476d2cf54b44c43e17070257250dcb369c33941de978b4cbeebe7aa0907c', // 38
    '0x2e34e826d632133dad489233d8c1629511cd29cdbb76279d24e87a91234b4469', // 37
    '0xf7dbf98bcebd7b803917e00e7e3292843a4b7bf66016638811cea4705a32d73e', // 36
    '0x552b743cae11fd5bf9396ce694c198057b1b9887555164583fe4d3b0bae11bf7', // 35
    '0xe17d4d0c4596ea7d5166ad5da600a6fdc49e26e0680135a2f7300eedfd0d8314', // 34
    '0xc6e7b8ebcda23de8fa8a7839845e03b3e5fca1304ca4ea47cfdbbaab17256db2', // 33
    '0x8078261dec1e387d1c43903ab6ac764c83240334a8cc31b3467a4789c74e842a', // 32
    '0xfb610f016e3ddb3c2683a54ffc2bdaf52e3c1b8a9c92673ee4e83d9c3e2a9c44', // 31
    '0x5c9b0f9c6c32d2690771169ec62dd648fef7bce3d45fe8a6505d99fdcbade27a', // 30
    '0xced11523d71c444ce6d4296aaf4be2198d13358dd33925218ba5e49ccee5de43', // 29
    '0xd9b668f2251fd16d5791542653970d4655cf8adb2cb25c7a6c25d39093bfa9d9', // 28
    '0xc215b9356db58ce05412439f49a842f8a3abe6c1792ff8f2c3ee425c3501023c', // 27
    '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060', // 26
    '0x0885b9e5184f497595e1ae2652d63dbdb2785de2e498af837d672f5765f28430', // 25
    '0xda4f6670ce8798f8ec58d92dd836302361a57ed666fa3b5e36ed97ef13a8b43b', // 24
    '0xa5c1d4d3503c1783df0eaaa71d9e0734bd262de1ee59f9ea5c99950c3718a5c0', // 23
    '0x495402df7d45fe36329b0bd94487f49baee62026d50f654600f6771bd2a596ab', // 22
    '0xe9ebfecc2fa10100db51a4408d18193b3ac504584b51a4e55bdef1318f0a30f9', // 21
    '0xca8891ce2a6397cdf3479f4306c93556188ae859b9c201b89a38f52660bbd18f', // 20
    '0xe75fb554e433e03763a1560646ee22dcb74e5274b34c5ad644e7c0f619a7e1d0', // 19
    '0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4', // 18
    '0x0357352473d64df14fb987f33bbc9c3cd317fafe7c9498139c6a0529b551a017', // 17
    '0x9462d061cc6c1b8757dc215946a2f373c24ad63a809d6ce82d50286b1cec1a67', // 16
    '0x4d3be4b45d248a2f456d41452dba99c600ad1a1501dcd494c3fdea7919e910c3', // 15
    '0x45fadd869d45916f80af8ffc9fba29b51b756482f41c47dcbda79fa0ee8a11b9', // 14
    '0x713f63c0cf0bfe9319ef0f4862788670d8c86e2818670dbeac14b74c4372a065', // 13
    '0x649f4a5dd6402a3d6d6f74d6b8aba3e79328237b9004252a8531579964e27320', // 12
    '0xdefd19006fb9e14150ed69272e4e7eeccbb798b6e0052d540e7b14687695f364', // 11
    '0x6d052eb1271cfb3e08f8052c0b136326c925e4cc20cd4141df93a65ad065b162', // 10
    '0x0d007405379f64495eb69c50803a2b4b94dd983d9772e66e7f97c60ee038fcfd', // 9
    '0x0be3761b74b84531b34bf03e20eeaadd4207cf54bcee77ca2809666e646d4507', // 8
    '0x1b6d3cc31110ec6dc949319d3db8dfecd6328d1a16ea9a14eee093d813b9837c', // 7
    '0xfda1581d16fefb467eab15f17a2218e980bde5e28a8f02c0be5cd308dc1044fb', // 6
    '0x3c351cea655b8a50348e6ffa1bfff5b4ce68f99366cfad3d8a02ffb01f63138a', // 5
    '0xd07cbde817318492092cc7a27b3064a69bd893c01cb593d6029683ffd290ab3a', // 4
    '0xb8d81a9e95e0d9f7d705f505b812c8c35d2fbdbce8ed58224781bf0420b555e9', // 3
    '0x2b5d31fd32799027f9826a57be1c1166378864d5b1d337f422f9db5a15a35ff5', // 2
    '0x4b8b3410e43d2bd626c518395fcc6fe017fd35d883f72cb8f772239fead9b1f2', // 1
  ],
  'euler-beats-genesis': [
    '0x545fdfb74b50605988029f09c2a93c1b4b867832213bcab53ed6574bbe9a5c3a',
    '0xb306ac81f9ff47b8204bdbf747fb9d5ba3fbe4eb1aa3e0f5b6661dfd193dd8f5',
    '0xf2838d2333e6e04cc901fc91dbcac6dad8499b0aaa3577c9c4d1bfb73ceaa915',
    '0x8270b2e2290e8c826a3138d802aafcf2b9abfefcb7b357cb6725f9b6489ca60b',
    '0xc182ae0817f1da86d8ae8d02e6161a12811f606d7412f67a35b53c032364d83f',
    '0xf42767c481bec203a7ff5cde62da682771ceaf8a1fbc6c689cd2639f50633630',
    '0x7d068fff0c226dd6e2fad2cf46fb39f0c700cf5f1e303698a0ffa231f2417396',
    '0x94cab7e12fcd0f19ade60abc91f3f782d0a37495b3961ee8d7468dc2fc56aa02',
    '0x05191cfcaa6d7cb2ec6bb9e53d9c230c55a6491faaae233986052cd45e89f1cd',
    '0x1f78db1751bdd764c8d6f0157497b67240353f3cabc552d72f1f1621a7b7e7b8',
    '0x22b8fbd54078f8e6c6a188083a662f677ae2cc0dac21bb77d0e466ff805e9eb1',
    '0xc9fa647724cc1dd228eb1f4f604c2f130eeabebc873dceb76fcbfc1ca9bc0a3b',
    '0xbcce22d9c171ce975b3f7b896cb73fa045a91bcce432c4302cda5a2b905002f5',
    '0xaa4bfa328a6f7005493988aa0e52f0a5687de47aa13d02b8df43a3d2d472e90b',
    '0xca3c39840dcfb55810c7d9d78e4f0641de5647ddeec09bc6f579c7b131a4abf4',
    '0x636c18818b21ebc7ff99ce093fcd2eecc996fd2837f70cd0009c0f88a79217df',
    '0xc8eeb796d5283f72645fd04949ce7f454bfa0729c6d0930462b7747470f41f93',
    '0xde7f8748afafa0b1623c8cc29fa18587d211227ec1ffc8aa3cae88863371e5c2',
    '0xfb48aa741bd2b4f03a7d934ccd0cb3d6b7c99027a6ec4001f46b3bdc19674d20',
    '0x78d971057a6f23a8bc885722e6e4288107e6fda6cbde1553f3a8603273243ec8',
    '0x58f4595800227a4bf8291d2b3a5ecd92d3ec1aab7e7c94d60025e7395eedcc0d',
    '0xfe0e048525958e286f8ba52bf45aa2b75c6f1ea6f5d31444306bfc55fff86968',
    '0x9432001dd5b61139b530eb7c650f631ffb6ff8a26b92b48d9b2c47ecffcfd26e',
    '0xd1720334784ce738f125217ab01b480c76f54dfb7f27ff2e9888141f9cd4ded1',
    '0xb9f8b07164ffb7a2f056944d2fb83076c85453b37fb6dfa0a0208191d79b46a2',
    '0x5e63fd0eb888a3b4d51ffacd9d17482e36a0ecdc1f7bf1b66cd08c6a6b00762c',
    '0x6a28b5af56ef6b7e36aae2fe1a8a61348d44f5da3a7e76a5d782aa0a9fff7f61',
    '0x8ce992d3d7e724102f7865ecb8cbe57b66e68de6b9d1eaab381602226d225675',
  ],
};

type State = {
  collectionMetadataMap: CollectionMetadataMap;
  collectionHashOrIdMap: { [id: string]: string[] };
  updateCollectionHashOrIdMap: (updateFn: (update: any) => void) => void;
  updateCollectionMetadataMap: (updateFn: (update: any) => void) => void;
};

export const useCollectionsStore = create<State>((set, get) => ({
  collectionMetadataMap: COLLECTION_METADATA_MAP,
  collectionHashOrIdMap: COLLECTION_TX_HASHES_MAP,
  updateCollectionHashOrIdMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.collectionHashOrIdMap);
      }),
    );
  },
  updateCollectionMetadataMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.collectionMetadataMap);
      }),
    );
  },
}));
