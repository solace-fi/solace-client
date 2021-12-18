# Installation

In a terminal window, run
```
git clone https://github.com/solace-fi/solace-core.git
git clone https://github.com/solace-fi/solace-client.git
cd solace-core
npm i
npx hardhat compile
cd ../solace-client
npm i
cp -r ../solace-core/client/. .
npm run start
```

The client should pop up in a new browser window, if not go to http://localhost:3000/

You will need to connect to the Hardhat network and import accounts with ETH on Hardhat to interact with the client.  

1: Install and open the metamask chrome extension  
![Metamask Home](public/images/Metamask_Home.png)

2: Ethereum Mainnet -> Custom RPC  
![Custom RPC](public/images/Metamask_Create_RPC.png)  

3: Create a network with these settings
![Network settings](public/images/Metamask_Network_Settings.png)  

4: Accounts -> Import Account
![Import Account](public/images/Metamask_Import_Account.png)  

Import an account for each of these private keys:  
Hardhat Account 1: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`  
Hardhat Account 2: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`  
![Import Accounts](public/images/Metamask_Import_Accounts.png)

Return to the client at http://localhost:3000/
![Dashboard](public/images/dashboard.png)
