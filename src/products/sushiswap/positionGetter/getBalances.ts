import { NetworkConfig, Token } from '../../../constants/types'
import { getProductTokenBalances, queryNativeTokenBalance } from '../../getBalances'
import ierc20Json from '../../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { ZERO } from '../../../constants'
import { rangeFrom0, bnCmp } from '../../../utils/numeric'

import masterchefABI from './_contracts/IMasterChef.json'
import masterchefStakingPoolABI from './_contracts/IMasterChefStakingPool.json'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import axios from 'axios'

const lpTokenAddressesByPoolId = [
  '0x06da0fd433c1a5d7a4faa01111c044910a184553',
  '0x397ff1542f962076d0bfe58ea045ffa2d347aca0',
  '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
  '0xf1f85b2c54a2bd284b1cf4141d64fd171bd85539',
  '0x31503dcb60119a812fee820bb7042752019f2355',
  '0x5e63360e891bd60c69445970256c260b0a6a54c6',
  '0xa1d7b2d891e3a1f9ef4bbc5be20630c2feb1c470',
  '0x001b6450083e531a5a7bf310bd2c1af4247e23d4',
  '0xc40d16476380e4037e6b1a2594caf6a6cc8da967',
  '0xa75f7c2f025f470355515482bde9efa8153536a8',
  '0xcb2286d9471cc185281c4f763d34a962ed212962',
  '0x088ee5007c98a9677165d78dd2109ae4a3d04d0c',
  '0x795065dcc9f64b5614c407a6efdc400da6221fb0',
  '0x611cde65dea90918c0078ac0400a72b0d25b9bb1',
  '0xaad22f5543fcdaa694b68f94be177b561836ae57',
  '0x117d4288b3635021a3d612fe05a3cbf5c717fef2',
  '0x95b54c8da12bb23f7a5f6e26c38d04acc6f81820',
  '0x58dc5a51fe44589beb22e8ce67720b5bc5378009',
  '0xdafd66636e2561b0284edde37e42d192f2844d40',
  '0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7',
  '0x0cfe7968e7c34a51217a7c9b9dc1690f416e027e',
  '0xceff51756c56ceffca006cd410b03ffc46dd3a58',
  '0xf169cea51eb51774cf107c88309717dda20be167',
  '0x17b3c19bd640a59e832ab73eccf716cb47419846',
  '0xfcff3b04c499a57778ae2cf05584ab24278a7fcb',
  '0x382c4a5147fd4090f7be3a9ff398f95638f5d39e',
  '0x2024324a99231509a3715172d4f4f4e751b38d4d',
  '0x0be88ac4b5c81700acf3a606a52a31c261a24a35',
  '0x518d6ce2d7a689a591bf46433443c31615b206c5',
  '0xe954c2d9ff2a4d260dcd32386b1f9fc8135d2522',
  '0x0c810e08ff76e2d0beb51b10b4614b8f2b4438f9',
  '0x6463bd6026a2e7bfab5851b62969a92f7cca0eb6',
  '0x2dbc7dd86c6cd87b525bd54ea73ebeebbc307f68',
  '0xba13afecda9beb75de5c56bbaf696b880a5a50dd',
  '0x68c6d02d44e16f1c20088731ab032f849100d70f',
  '0x269db91fc3c7fcc275c2e6f22e5552504512811c',
  '0x742c15d71ea7444964bc39b0ed729b3729adc361',
  '0xd75ea151a61d06868e31f8988d28dfe5e9df57b4',
  '0x15e86e6f65ef7ea1dbb72a5e51a07926fb1c82e3',
  '0xd597924b16cc1904d808285bc9044fd51ceeead7',
  '0x5a2943b25ce0678dc0b351928d2db331a55d94ea',
  '0x53aabccae8c1713a6a150d9981d2ee867d0720e8',
  '0x34b13f8cd184f55d0bd4dd1fe6c07d46f245c7ed',
  '0xbcedc25cbb0ea44e03e41dc2d00d54fe6d4646db',
  '0x0f82e57804d0b1f6fab2370a43dcfad3c7cb239c',
  '0xfb736dad22b879f055c7aebf3a2e8a197f923ea1',
  '0x69b39b89f9274a16e8a19b78e5eb47a4d91dac9e',
  '0x0289b9cd5859476ce325aca04309d36addcebdaa',
  '0x97f34c8e5992eb985c5f740e7ee8c7e48a1de76a',
  '0x9fc5b87b74b9bd239879491056752eb90188106d',
  '0x6f58a1aa0248a9f794d13dc78e74fc75140956d7',
  '0xee6d78755e06c31ae7a5ea2b29b35c073dfc00a9',
  '0x4f871f310ad0e8a170db0021c0ce066859d37469',
  '0x364248b2f1f57c5402d244b2d469a35b4c0e9dab',
  '0xd7c2a4aa31e1bf08dc7ff44c9980fa8573e10c1b',
  '0x033ecd066376afec5e6383bc9f1f15be4c62dc89',
  '0xe4455fdec181561e9ffe909dde46aaeaedc55283',
  '0x0bff31d8179da718a7ee3669853cf9978c90a24a',
  '0xaf988aff99d3d0cb870812c325c588d8d8cb7de8',
  '0xc5fa164247d2f8d68804139457146efbde8370f6',
  '0x35a0d9579b1e886702375364fe9c540f97e4517b',
  '0x5e94cb9c309775763edbd4abf248a229880e68c6',
  '0xdc549b8199ec396fd9ff7e431cfc3cf9b40f2163',
  '0xdff71165a646be71fcfbaa6206342faa503aed5d',
  '0x378b4c5f2a8a0796a8d4c798ef737cf00ae8e667',
  '0xef4f1d5007b4ff88c1a56261fec00264af6001fb',
  '0x1c580cc549d03171b13b55074dc1658f60641c73',
  '0xf45d97f9d457661783146d63dd13da20ce9bf847',
  '0x4441eb3076f828d5176f4fe74d7c775542dae106',
  '0xfb3cd0b8a5371fe93ef92e3988d30df7931e2820',
  '0x44d34985826578e5ba24ec78c93be968549bb918',
  '0x23a9292830fc80db7f563edb28d2fe6fb47f8624',
  '0xb12aa722a3a4566645f079b6f10c89a3205b6c2c',
  '0x110492b31c59716ac47337e616804e3e3adc0b4a',
  '0x9360b76f8f5f932ac33d46a3ce82ad6c52a713e5',
  '0xa73df646512c82550c2b3c0324c4eedee53b400c',
  '0xadeaa96a81ebba4e3a5525a008ee107385d588c3',
  '0xf1360c4ae1cead17b588ec1111983d2791b760d3',
  '0x0040a2cebc65894bc2cfb57565f9acfa33fab137',
  '0x9cd028b1287803250b1e226f0180eb725428d069',
  '0x67e475577b4036ee4f0f12fa2d538ed18cef48e3',
  '0x53e9fb796b2feb4b3184afdf601c2a2797548d88',
  '0xe5f06db4f3473e7e35490f1f98017728496fe81e',
  '0x26d8151e631608570f3c28bec769c3afee0d73a3',
  '0xab3f8e0214d862bf7965d3cec7431d7c1a85cb34',
  '0x8b00ee8606cc70c2dce68dea0cefe632cca0fb7b',
  '0xaa500101c73065f755ba9b902d643705ef2523e3',
  '0xeb1b57d4f7d4557b032b66c422bc94a8e4af859e',
  '0x5f30aac9a472f6c33d5284f9d340c0d57ef33697',
  '0x83e5e791f4ab29d1b0941bc4d00f3d6027d1dae5',
  '0xd8b8b575c943f3d63638c9563b464d204ed8b710',
  '0xc2b0f2a7f736d3b908bdde8608177c8fc28c1690',
  '0xb2c29e311916a346304f83aa44527092d5bd4f0f',
  '0x98c2f9d752e044dc2e1f1743bf0b76a7096eceb2',
  '0x8c2e6a4af15c94cf4a86cd3c067159f08571d780',
  '0xfceaaf9792139bf714a694f868a215493461446d',
  '0xf55c33d94150d93c2cfb833bcca30be388b14964',
  '0xca658217ce94dfb2156a49a8fad0ff752cac39c2',
  '0x71817445d11f42506f2d7f54417c935be90ca731',
  '0xb1d38026062ac10feda072ca0e9b7e35f1f5795a',
  '0x201e6a9e75df132a8598720433af35fe8d73e94d',
  '0x66ae32178640813f3c32a9929520bfe4fef5d167',
  '0x049a1df43ca577c1db44a79cf673b443beed9f89',
  '0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3',
  '0x31d64f9403e82243e71c2af9d8f56c7dbe10c178',
  '0xa8aec03d5cf2824fd984ee249493d6d4d6740e61',
  '0x8cd7dadc8e11c8706763e0de7332f5ea91e04e35',
  '0x51f5953659e7d63cf0ef60b8674ef819c225169e',
  '0x54bcf4948e32a8706c286416e3ced37284f17fc9',
  '0xc558f600b34a5f69dd2f0d06cb8a88d829b7420a',
  '0x87bf6386f7611afa452c642c2835a305a692607d',
  '0xbe1e98685fb293144325440c16f69954ffcb790c',
  '0x760166fa4f227da29ecac3bec348f5fa853a1f3c',
  '0x7b98e476de2c50b6fa284dbd410dd516f9a72b30',
  '0x02c6260ce42ea5cd055911ed0d4857ecd4583740',
  '0x663242d053057f317a773d7c262b700616d0b9a0',
  '0x0eee7f7319013df1f24f5eaf83004fcf9cf49245',
  '0x18a797c7c70c1bf22fdee1c09062aba709cacf04',
  '0xa7f11e026a0af768d285360a855f2bded3047530',
  '0x2ee59d346e41478b9dc2762527facf2082022a29',
  '0x22def8cf4e481417cb014d9dc64975ba12e3a184',
  '0x41328fdba556c8c969418ccccb077b7b8d932aa5',
  '0xfa8c3f98debf3d0a192e2edf9182352332def35c',
  '0xfa5bc40c3bd5afa8bc2fe6b84562fee16fb2df5f',
  '0xac63290a9d32cc01c7e2f5d02fc4225f843168a4',
  '0x9386d6ebbbb9f8002c5238dbd72b2e61ad7d9011',
  '0xed4290b3c49df20319b3132f7007dcb3b0522e34',
  '0x17a2194d55f52fd0c711e0e42b41975494bb109b',
  '0x46acb1187a6d83e26c0bb46a57ffeaf23ad7851e',
  '0xf79a07cd3488bbafb86df1bad09a6168d935c017',
  '0xb46736888247c68c995b156ca86426ff32e27cc9',
  '0x0c48ae092a7d35be0e8ad0e122a02351ba51fedd',
  '0x10b47177e92ef9d5c6059055d92ddf6290848991',
  '0xb270176ba6075196df88b855c3ec7776871fdb33',
  '0xf5a434fbaa1c00b33ea141122603c43de86cc9fe',
  '0x132eeb05d5cb6829bd34f552cde0b6b708ef5014',
  '0xbbfd9b37ec6ea1ca612ab4adef6d8c6ece1a4134',
  '0x1c615074c281c5d88acc6914d408d7e71eb894ee',
  '0x96f5b7c2be10dc7de02fa8858a8f1bd19c2fa72a',
  '0x7b504a15ef05f4eed1c07208c5815c49022a0c19',
  '0x0e26a21013f2f8c0362cfae608b4e69a249d5efc',
  '0xec78bd3b23ac867fcc028f2db405a1d9a0a2f712',
  '0x092493a22375de1b17583d924abf9e8bf884491c',
  '0xfd38565ef22299d491055f0c508f62dd9a669f0f',
  '0x0267bd35789a5ce247fff6cb1d597597e003cc43',
  '0xca2ae9c5c491f497dc5625feaef4572076c946c5',
  '0x608f8af5fd49b5a5421f53f79920c45b96bda83f',
  '0xd54a895623552853f8d673981cc32eb8f3929dfb',
  '0x0e7e8dde18e4016ccc15f12301a47ef7b87bdafa',
  '0xf39ff863730268c9bb867b3a69d031d1c1614b31',
  '0x0bc5ae46c32d99c434b7383183aca16dd6e9bdc8',
  '0x3cf1cf47bc87c23cd9410549bd8a75e82c1c73cf',
  '0xa3dfbf2933ff3d96177bde4928d0f5840ee55600',
  '0x93e2f3a8277e0360081547d711446e4a1f83546d',
  '0x938625591adb4e865b882377e2c965f9f9b85e34',
  '0x38a0469520534fc70c9c0b9de4b8649e36a2ae3e',
  '0x8486c538dcbd6a707c5b3f730b6413286fe8c854',
  '0x9c86bc3c72ab97c2234cba8c6c7069009465ae86',
  '0xb0484fb3ac155aaf7d024b20f1a569ddd6332c32',
  '0xfe308fe2eb938f772807aec2e87fc762d47c40e0',
  '0xd3c41c080a73181e108e0526475a690f3616a859',
  '0x28d70b2d5ada1d8de7f24711b812fd7ab3c0fbc5',
  '0x1803a3386d44f65746403060ab0137682f554484',
  '0x05cc2e064e0b48e46015ead9961f1391d74e5f83',
  '0x75382c52b6f90b3f8014bfcadac2386513f1e3bc',
  '0xf9440fedc72a0b8030861dcdac39a75b544e7a3c',
  '0x0a54d4b378c8dbfc7bc93be50c85debafdb87439',
  '0x87b6f3a2dc6e541a9ce40e58f517953782ae614e',
  '0x90825add1ad30d7dcefea12c6704a192be6ee94e',
  '0x31fa985bb0c282a814e7f3f0dce88b2a44197f60',
  '0xf13eef1c6485348b9c9fa0d5df2d89accc5b0147',
  '0x5e496b7d72362add1eea7d4903ee2732cd00587d',
  '0xbe71372995e8e920e4e72a29a51463677a302e8d',
  '0x328dfd0139e26cb0fef7b0742b49b0fe4325f821',
  '0xb5c40e038c997c2946b24dc179f7cdcd279d8847',
  '0xee35e548c7457fcdd51ae95ed09108be660ea374',
  '0xf5ca27927ffb16bd8c870dcb49750146cce8217c',
  '0x91a48c69ec3f3ce855fe5054f82d2bef8fd66c43',
  '0xa1f967f25ae32bd3435e45ea8657de16ce5a4ae6',
  '0x9e48fadf799e0513d2ef4631478ea186741fa617',
  '0x7835cb043e8d53a5b361d489956d6c30808349da',
  '0xc7ff546c6cbc87ad9f6f557db5a0df5c742ca440',
  '0x033f4a33823595a6dd9df0672fd94de32c65c415',
  '0xa872d244b8948dfd6cb7bd19f79e7c1bfb7db4a0',
  '0x750d711277fd27d1ec5256f13f5110e097713a95',
  '0x34d7d7aaf50ad4944b70b320acb24c95fa2def7c',
  '0x577959c519c24ee6add28ad96d3531bc6878ba34',
  '0x662511a91734aea8b06ef770d6ed51cc539772d0',
  '0xa30911e072a0c88d55b5d0a0984b66b0d04569d0',
  '0x08af656295e0ea970fc4e35a75e62e5aade3f9af',
  '0xff7d29c7277d8a8850c473f0b71d7e5c4af45a50',
  '0xb7b45754167d65347c93f3b28797887b4b6cd2f3',
  '0x5f92e4300024c447a103c161614e6918e794c764',
  '0xf678b4a096bb49309b81b2a1c8a966ef5f9756ba',
  '0x418bc3ff0ba33ad64931160a91c92fa26b35acb0',
  '0x668edab8a38a962d30602d6fa7ca489484ee3224',
  '0xc84fb1f76cbdd3b3491e81fe3ff811248d0407e9',
  '0x561770b93d0530390eb70e17acbbd6e5d2f52a31',
  '0x4f68e70e3a5308d759961643afcadfc6f74b30f4',
  '0x0a8d9241998c91747ce1672a0c31af2b33bd87bd',
  '0x0a7cc061f0ccd2a1b6f07762663a9ec10720fcc5',
  '0x002469ed116e8e2764f2e0869bd95317ee634334',
  '0x0ee6f615d982cc1ad4bb9ae3e9bf02ed5b68858e',
  '0xf71e398b5cbb473a3378bf4335256295a8ed713d',
  '0x2bb55aad93dee6217bb7887fe563718e5b5976cb',
  '0x45da3a59850525aab0aca23f0b11f442d4b74c85',
  '0xcd769f48151ca671f8545e40efe03ff7ffa157fb',
  '0x795feb1c35dc07991bfd23ab74378885ec86c233',
  '0x51d24429a72fa5be5b588a0de83a45f12fd57e57',
  '0xa62d2e74d41d3477f7726e8f6a845269799df573',
  '0xc2a0254dfe1ac6d39fe17f11ef1af0a3faf87448',
  '0xb5a98cd1030a7bb28716217e97d18cfa2aac4fc7',
  '0x659b4642ff3d0719f71eae903ce9f46b20767642',
  '0x81f535db4df20271be8ab5caff29ba70b3709f90',
  '0x891535966bec70d447882c3eb1ab3926ddc5f788',
  '0x82e9c2c3236de403509de0472f2f3e16077bc42d',
  '0x663045d8ce1c61b9e0af2c3469f17d3c152a66ba',
  '0xb89313816cc3b2f9ec885860274c266355f2306d',
  '0x263716dee5b74c5baed665cb19c6017e51296fa2',
  '0xf9a4e1e117818fc98f9808f3df4d7b72c0df4160',
  '0x05ad6d7db640f4382184e2d82dd76b4581f8f8f4',
  '0xbe9081e742d9e24aa0584a4f77382062f033752f',
  '0x65089e337109ca4caff78b97d40453d37f9d23f8',
  '0x40a12179260997c55619de3290c5b9918588e791',
  '0xa01f36655fc3ae0f618b29943c4ac242d71f6f50',
  '0xa898974410f7e7689bb626b41bc2292c6a0f5694',
  '0xdf55bd0a205ec067ab1cacfaeef708cf1d93ecfd',
  '0x809f2b68f59272740508333898d4e9432a839c75',
  '0x15785398cf9fb677ddcbdb1133585a4d0c65c2d9',
  '0xa16c84206a6b69c01833101133cc78a47602349d',
  '0x9461173740d27311b176476fa27e94c681b1ea6b',
  '0x0c365789dbbb94a29f8720dc465554c587e897db',
  '0x8d782c5806607e9aafb2ac38c1da3838edf8bd03',
  '0x34d25a4749867ef8b62a0cd1e2d7b4f7af167e01',
  '0x164fe0239d703379bddde3c80e4d4800a1cd452b',
  '0x18d98d452072ac2eb7b74ce3db723374360539f1',
  '0x4fb3cae84a1264b8bb1911e8915f56660ec8178e',
  '0x41848373dec2867ef3924e47b2ebd0ee645a54f9',
  '0x37922c69b08babcceae735a31235c81f1d1e8e43',
  '0x69ab811953499eb253c5a69ae06275a42b97c9ae',
  '0x1bec4db6c3bc499f3dbf289f5499c30d541fec97',
  '0x8f9ef75cd6e610dd8acf8611c344573032fb9c3d',
  '0xc79faeed130816b38e5996b79b1b3b6568cc599f',
  '0xd3da6236aecb6b55f571249c011b8eec340a418e',
  '0x6a091a3406e0073c3cd6340122143009adac0eda',
  '0x67adc7432ce278486cc84fbc705bf70b5ab33a95',
  '0x77f3a4fa35bac0ea6cfac69037ac4d3a757240a1',
  '0x6eafe077df3ad19ade1ce1abdf8bdf2133704f89',
  '0x3485a7c8913d640245e38564ddc05bfb40104635',
  '0x17fb5f39c55903de60e63543067031ce2b2659ee',
  '0xa5e3142b7a5d59f778483a7e0fd3fe4e263388e9',
  '0x804be24f625c7e23edd9fa68e4582590c57ad2b3',
  '0x3bfca4fb8054fa42da3e77749b21450a1290beed',
  '0x9ac60b8b33092c2c0b4ca5af0dec2bcb84657e12',
  '0x0780b42b3c4caf41933cfc0040d2853363de20a7',
  '0x82ebcd936c9e938704b65027850e42393f8bc4d4',
  '0x7229d526d5fd693720b88eb7129058db5d497bce',
  '0x87b918e76c92818db0c76a4e174447aee6e6d23f',
  '0xe73ad09925201f21b607ccada9a371c12a2f49c3',
  '0x2f8ac927aa94293461c75406e90ec0ccfb2748d9',
  '0xb1eecfea192907fc4bf9c4ce99ac07186075fc51',
  '0x0d2606158fa76b38c5d58db94b223c3bdcbbf57c',
  '0x6d6542b07241107b16c71c20f035f190cda75237',
  '0x2bfd753982ff94f4d2503d6280a68fca5da114a7',
  '0x94a5a6d050b030e3a6d5211a70ae502afab98d73',
  '0x51c8796563d9cf2b3d938362a9522f21db2c690d',
  '0x0ea032decbfbea581d77d4a9b9c5e9db7c102a7c',
  '0x651c7e8fa0add8c4531440650369533105113282',
  '0x57024267e8272618f9c5037d373043a8646507e5',
  '0x6469b34a2a4723163c4902dbbdea728d20693c12',
  '0x2c51eaa1bcc7b013c3f1d5985cdcb3c56dc3fbc1',
  '0x0589e281d35ee1acf6d4fd32f1fba60effb5281b',
  '0xd45afa3649e57a961c001b935ded1c79d81a9d23',
  '0x613c836df6695c10f0f4900528b6931441ac5d5a',
  '0x0bb6e2a9858a089437ec678da05e559ffe0af5b2',
  '0xa914a9b9e03b6af84f9c6bd2e0e8d27d405695db',
  '0x8911fce375a8414b1b578be66ee691a8d2d4dbf7',
  '0xe8eb0f7b866a85da49401d04fffcfc1abbf24dfd',
  '0x986627db5e4aae987f580feb63d475992e5ac0ae',
  '0x17890deb188f2de6c3e966e053da1c9a111ed4a5',
  '0xe93b1b5e1dadce8152a69470c1b31463af260296',
  '0x1241f4a348162d99379a23e73926cf0bfcbf131e',
  '0x0652687e87a4b8b5370b05bc298ff00d205d9b5f',
  '0xa2d81bedf22201a77044cdf3ab4d9dc1ffbc391b',
  '0x82dbc2673e9640343d263a3c55de49021ad39ae2',
  '0xdbaa04796cb5c05d02b8a41b702d9b67c13c9fa9',
  '0x8775ae5e83bc5d926b6277579c2b0d40c7d9b528',
  '0xbbbdb106a806173d1eea1640961533ff3114d69a',
  '0xb90047676cc13e68632c55cb5b7cbd8a4c5a0a8e',
  '0xada8b1613ce6fe75f3549fa4eb2a993ca1220a7c',
  '0x8597fa0773888107e2867d36dd87fe5bafeab328',
  '0xb124c4e18a282143d362a066736fd60d22393ef4',
  '0xc96f20099d96b37d7ede66ff9e4de59b9b1065b1',
  '0x77337ff10206480739a768124a18f3aa8c089153',
  '0xeefa3b448768dd561af4f743c9e925987a1f8d09',
  '0x279ca79d5fb2490721512c8ae4767e249d75f41b',
  '0x0d15e893cf50724382368cafed222cf131b55307',
  '0x1cb9e12b35199bee15d9ee13696b87bb777776dd',
  '0xb5de0c3753b6e1b4dba616db82767f17513e6d4e',
  '0x208226200b45b82212b814f49efa643980a7bdd1',
  '0x9cee2ad771b57555c93f55d8babc3c8a221e3b74',
  '0x53813285cc60b13fcd2105c6472a47af01f8ac84',
  '0xc926990039045611eb1de520c1e249fd0d20a8ea',
  '0x400043e27415773e4a509c53ac5d7d3c036f6d92',
  '0x0bec54c89a7d9f15c4e7faa8d47adedf374462ed',
  '0x4a86c01d67965f8cb3d0aaa2c655705e64097c31',
  '0x0d9f9c919f1b66a8587a5637b8d1a6a6c5854380',
  '0xf3d4206b8f2b7c63290661c99a2b494aef3b8c30',
  '0xc8a6189bb16331b37c7a903b8904201b4ca7accb',
  '0x5d472c9edece12a75ed7c0584dd02407cb5b47da',
  '0x698abbbc986c59d02941e18bc96fe2396493339b',
  '0x38e03a5fb1b1a18d47b364cdd7cdce606397c72c',
  '0x0463a06fbc8bf28b3f120cd1bfc59483f099d332',
  '0xef4fa701fa5df88ef0d5707d6144e446a1a2238b',
  '0x0225e940deecc32a8d7c003cfb7dae22af18460c',
  '0x0a2f9b5360b5c7b6d3ce826971425b3b8b766519',
  '0xfd52305d58f612aad5f7e5e331c7a0d77e352ec3',
  '0xec87cb93ecd0fe2f80dbd0d85431eacf1de09d50',
  '0xe339c1d0a744053cbceb0d2dc2d13967c8a69586',
  '0xd829de54877e0b66a2c3890b702fa5df2245203e',
]

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  const balances: Token[] = tokens

  /*

    farm contract segment

  */

  const masterChefStakingContract = getContract(
    '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd',
    masterchefStakingPoolABI,
    provider
  )

  const farmTokensToAdd: Token[] = []

  for (let i = 0; i < balances.length; i++) {
    const poolIdx = lpTokenAddressesByPoolId.findIndex((lpToken) => lpToken == balances[i].token.address.toLowerCase())

    if (poolIdx != -1) {
      // check staking contract for balances
      const userInfo = await masterChefStakingContract.userInfo(BigNumber.from(poolIdx), balances[i].metadata.user)

      const amount = userInfo.amount
      if (amount.gt(ZERO)) {
        const farmToken: Token = {
          token: {
            address: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd',
            name: `MasterChef LP Staking Pool (${balances[i].underlying[0].symbol}/${balances[i].underlying[1].symbol})`,
            symbol: 'SLP',
            decimals: balances[i].token.decimals,
            balance: amount,
          },
          underlying: balances[i].underlying,
          eth: {
            balance: ZERO,
          },
          tokenType: 'farm',
          metadata: {
            lpTokenAddress: balances[i].token.address,
          },
        }
        farmTokensToAdd.push(farmToken)
      }
    }
  }

  const poolTokenBalances: Token[] = await getProductTokenBalances(user, ierc20Json.abi, tokens, provider)

  const newBalances: Token[] = []
  newBalances.push(...poolTokenBalances)
  newBalances.push(...farmTokensToAdd)

  /*

    get balances for lptokens in user wallet (and fetched farm positions)

  */

  for (let i = 0; i < newBalances.length; i++) {
    const token0Contract = getContract(newBalances[i].underlying[0].address, ierc20Json.abi, provider)
    const token1Contract = getContract(newBalances[i].underlying[1].address, ierc20Json.abi, provider)

    const bal0 = await withBackoffRetries(async () =>
      token0Contract.balanceOf(
        newBalances[i].tokenType == 'token' ? newBalances[i].token.address : newBalances[i].metadata.lpTokenAddress
      )
    )
    const bal1 = await withBackoffRetries(async () =>
      token1Contract.balanceOf(
        newBalances[i].tokenType == 'token' ? newBalances[i].token.address : newBalances[i].metadata.lpTokenAddress
      )
    )

    const lpTokenContract =
      newBalances[i].tokenType == 'token'
        ? getContract(newBalances[i].token.address, ierc20Json.abi, provider)
        : getContract(newBalances[i].metadata.lpTokenAddress, ierc20Json.abi, provider)

    const liquidity =
      newBalances[i].tokenType == 'token'
        ? await withBackoffRetries(async () => lpTokenContract.balanceOf(newBalances[i].token.address))
        : await withBackoffRetries(async () => lpTokenContract.balanceOf(newBalances[i].metadata.lpTokenAddress))

    const adjustedLiquidity = liquidity.add(newBalances[i].token.balance)
    const totalSupply = await lpTokenContract.totalSupply()
    const amount0 = adjustedLiquidity.mul(bal0).div(totalSupply)
    const amount1 = adjustedLiquidity.mul(bal1).div(totalSupply)
    newBalances[i].underlying[0].balance = amount0
    newBalances[i].underlying[1].balance = amount1

    let standingEthAmount = ZERO
    for (let j = 0; j < newBalances[i].underlying.length; j++) {
      const fetchedAmount = await queryNativeTokenBalance(newBalances[i].underlying[j], activeNetwork.chainId)
      standingEthAmount = standingEthAmount.add(fetchedAmount)
    }
    newBalances[i].eth.balance = standingEthAmount
  }
  return newBalances
}
