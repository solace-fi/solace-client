# client

The solace.fi web interface

## How to start

---

Install dependencies

    npm install

Run using the following react command

    npm start

## Project Structure

---

    src/
    |___components/
    |   |____ui/
    |   |____wallets/
    |   |____web3/
    |___constants/
    |   |____abi/
    |___context/
    |   |____ContractsManager
    |   |____Web3Manager
    |___ethers/
    |   |____connectors/
    |   |____contracts/
    |   |____wallets/
    |___hooks/
    |___pages/
    |   |____dashboard/
    |   |____invest/
    |   |____quote/
    |   |____App
    |___utils/

## Design Decisions

---

There are two git repositories that influenced this application design direction, [Barnbridge](https://github.com/BarnBridge/barnbridge-frontend)
and [Uniswap](https://github.com/Uniswap/uniswap-interface).

At the time of writing, Barnbridge utilized Web3 and React Context, while Uniswap utilized Redux and Ethers, but they both used Web3-react. To make the most of our application, we tried to get the best of both worlds using the following stack: React Context, Ethers, and Web3-React.

There was also a difference in the organization of connectors and contracts observed in both repositories. Barnbridge centralized all of its contracts into a single Context provider, while Uniswap molded its contract functions into hooks that are called by different components of the application.

## User Journeys

---

### Connecting and disconnecting wallet

Upon starting the application, the Context provider that manages Web3 keeps track of what provider is available. Whether the user selects a provider or not, it is saved locally onto the user's browser. The provider, or the lack of, is then propagated throughout the application.

### Changing between pages

The application uses a HashRouter that will display different components or pages to the user based on the URL.
