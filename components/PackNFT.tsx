import { MARKETPLACE_ADDRESS, PACK_ADDRESS } from "../const/addresses";
import { ThirdwebNftMedia, Web3Button, useAddress, useContract, useDirectListings, useNFT } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import styles from "../styles/Home.module.css";

type Props = {
    contractAddress: string;
    tokenId: any;
};

export const PackNFTCard = ({ contractAddress, tokenId }: Props) => {
    const address = useAddress();

    const { contract: marketplace, isLoading: loadingMarketplace } = useContract(MARKETPLACE_ADDRESS, "marketplace-v3");
    const { contract: packContract } = useContract(contractAddress);
    const { data: packNFT, isLoading: loadingNFT } = useNFT(packContract, tokenId);

    const { data: packListings, isLoading: loadingPackListings } = 
    useDirectListings(
        marketplace,
        {
            tokenContract: PACK_ADDRESS,
        }
    );
    console.log("Pack Listings: ", packListings);

    async function buyPack() {
        let txResult;

        if (packListings?.[tokenId]) {
            try {
                if (!marketplace) {
                    throw new Error("Marketplace contract is not loaded");
                }

                // Get the signer from the provider
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                // Connect the signer to the marketplace contract
                const marketplaceWithSigner = marketplace.connect(signer);

                // Call the buyFromListing method with the specified gas limit
                const tx = await marketplaceWithSigner.directListings.buyFromListing(
                    packListings[tokenId].id,
                    1,
                    { gasLimit: 2000000 }
                );
                txResult = await tx.wait();
            } catch (error) {
                console.error("Error buying pack:", error);
            }
        } else {
            throw new Error("No valid listing found");
        }
            
        return txResult;
    };

    const mediaStyle = {
        width: "100%",
        height: "300px",
        objectFit: "contain" as "contain",
        borderRadius: "8px",
    };

    return (
        <div className={styles.packCard}>
            {!loadingNFT && !loadingPackListings ? (
                <div className={styles.shopPack}>
                    <div className={styles.mediaGrid}>
                        {packNFT?.metadata && (
                            <ThirdwebNftMedia metadata={packNFT.metadata} style={mediaStyle} />
                        )}
                    </div>
                    <div className={styles.packInfo}>
                        <h3>{packNFT?.metadata?.name}</h3>
                        
                        <p>Cost: {packListings![tokenId].currencyValuePerToken.displayValue} {` ` + packListings![tokenId].currencyValuePerToken.symbol}</p>
                        <p>Supply: {packListings![tokenId].quantity}</p>
                        {!address ? (
                            <p>Login to buy</p>
                        ) : (
                            <Web3Button
                            contractAddress={MARKETPLACE_ADDRESS}
                            action={() => buyPack()}
                            >Buy Pack</Web3Button>
                        )}
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )
};
