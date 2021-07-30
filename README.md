# client

### The solace.fi web interface

![Dashboard](./public/images/dashboard.png)

![Invest](./public/images/invest.png)

![Quote](./public/images/quote.png)

![Govern](./public/images/govern.png)

![ManageModal](./public/images/managemodal.png)

![ClaimModal](./public/images/claimmodal.png)

## Where do I start reading through this code?

---

Start with src/index, it's the entry point.

## How to start testing locally

---

Note: This project was originally developed alongside the Hardhat framework.

Install dependencies

    npm install

Run the following commands from the core directory

    npx hardhat compile
    npx hardhat node

In a different terminal, run the following commands from the core directory

    npx hardhat run --network localhost scripts/deploy.ts

After the deploy script is ran, copy the contract addresses into the chainConfig.ts file at client/src/config. Be sure that the name of the contract matches the name of the object within the config file.

Run using the following react command from the client directory

    npm start

## Project Structure

    src/
    |___components/
    |___config/
    |___constants/
    |   |____abi/
    |___context/
    |   |____ContractsManager
    |   |____NotificationssManager
    |   |____ProviderManager
    |   |____UserDataManager
    |   |____WalletManager
    |___wallet/
    |   |____connectors/
    |   |____wallets/
    |___hooks/
    |___pages/
    |   |____dashboard/
    |   |____govern/
    |   |____invest/
    |   |____quote/
    |   |____App
    |___static/
    |___styles/
    |___utils/

## React Context Structure

    <ProviderManager>              // web3 Provider
      <WalletManager>              // wallet connection
        <ContractsManager>         // contracts
          <CachedDataManager>      // cached data
            <NotificationsManager> // notifications and toasts
              ...
                <App />
              ...
            </NotificationsManager>
          </CachedDataManager>
        </ContractsManager>
      </WalletManager>
    </ProviderManager>

ProviderManager allows access to the provider from Alchemy, this is used to call read-only contract methods.

WalletManager allows access to web3-react, wallet connection functionalities, and wallet balance.

ContractsManager allows centralized access to contracts.

CachedDataManager allows the app to access data that is already cached onto the app.

NotificationsManager allows the app to create notifications for the user.

We may need more Context providers in the future, for data such as themes and user preferences.

## Beginning Design Decisions

There are two git repositories that initially influenced the design direction of this application, [Barnbridge](https://github.com/BarnBridge/barnbridge-frontend)
and [Uniswap](https://github.com/Uniswap/uniswap-interface).

At the time of writing, Barnbridge utilized Web3 and React Context, while Uniswap utilized Redux and Ethers, but they both used Web3-react. To make the most of our application, we tried to get the best of both worlds using the following stack: React Context, Ethers, and Web3-React.

There was also a difference in the organization of connectors and contracts observed in both repositories. Barnbridge centralized all of its contracts into a single Context provider, while Uniswap centralized contract hooks and molded its contract functions into hooks that are called by different components of the application. This application was able to mesh the two types of organizations together.
