# client

### The solace.fi web interface

## Technologies

---

React Framework, TypeScript, Styled Components

## Where do I start reading through this code?

---

Start with src/index, it's the entry point.

## How to start testing locally

---

Note: This project was originally developed alongside the Hardhat framework.

After you clone the core directory, you must clone this client directory inside because client is dependent on core.

This codebase has been developed using Node v16.0.0 and Npm v7.10.0, if you are facing issues with the dependencies, try using these versions. Be mindful that these versions may change in the future.

Install dependencies on both core and client directories

    npm install

Run the following command from the core directory to fetch contract ABIs

    npx hardhat compile

Run the following react command from the client directory to start the app

    npm start

## Project Structure

    src/
    |___analytics/
    |___components/
        |___atoms/
        |___molecules/
        |___organisms/
    |___networks/
    |___constants/
    |   |____mappings/
    |   |____addresses/
    |   |____abi/
    |   |____enums/
    |   |____types/
    |___context/
    |   |____GeneralManager
    |   |____ContractsManager
    |   |____NotificationsManager
    |   |____ProviderManager
    |   |____CachedDataManager
    |   |____WalletManager
    |   |____NetworkManager
    |___wallet/
    |   |____wallet-connectors/
    |___hooks/
    |___pages/
    |   |____about/
    |   |____bond/
    |   |____cover/
    |   |____govern/
    |   |____invest/
    |   |____quote/
    |   |____soteria/
    |   |____stake/
    |   |____terms/
    |   |____App
    |___resources/
    |___styles/
    |___utils/

## React Context Structure

    <GeneralProvider>                  // user-related data
      <NetworkManager>                 // network management
        <WalletManager>                // wallet connection
          <ProviderManager>            // network-wallet mediator
            <ContractsManager>         // contracts
              <CachedDataManager>      // cached data
                <NotificationsManager> // notifications and toasts
                  ...
                </NotificationsManager>
              </CachedDataManager>
            </ContractsManager>
          </ProviderManager>
        </WalletManager>
      </NetworkManager>
    </GeneralProvider>

GeneralManager allows access to the theme, user preferences and other data that should be at the top of the data flow.

NetworkManager allows access to current network and its configuration.

WalletManager allows access to web3-react and wallet connection functionalities.

ProviderManager allows functions from Network and Wallet Managers to work together.

ContractsManager allows centralized access to contracts.

CachedDataManager allows the app to access data that is already cached onto the app.

NotificationsManager allows the app to create notifications for the user.

## Beginning Design Decisions

There are two git repositories that initially influenced the design direction of this application, [Barnbridge](https://github.com/BarnBridge/barnbridge-frontend)
and [Uniswap](https://github.com/Uniswap/uniswap-interface).

At the time of writing, Barnbridge utilized Web3 and React Context, while Uniswap utilized Redux and Ethers, but they both used Web3-react. To make the most of our application, we tried to get the best of both worlds using the following stack: React Context, Ethers, and Web3-React.

There was also a difference in the organization of connectors and contracts observed in both repositories. Barnbridge centralized all of its contracts into a single Context provider, while Uniswap centralized contract hooks and molded its contract functions into hooks that are called by different components of the application. This application was able to mesh the two types of organizations together. Over time, the design of the app was slowly following Barnbridge's direction.
