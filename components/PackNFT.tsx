import { MARKETPLACE_ADDRESS, PACK_ADDRESS } from "../const/addresses";
import { Web3Button, useAddress, useContract, useDirectListings, useNFT, ThirdwebNftMedia } from "@thirdweb-dev/react";
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

    const { data: packListings, isLoading: loadingPackListings } = useDirectListings(
        marketplace,
        {
            tokenContract: PACK_ADDRESS,
        }
    );
    console.log("Pack Listings: ", packListings);

    async function buyPack() {
        let txResult;

        if (packListings?.[tokenId]) {
            txResult = await marketplace?.directListings.buyFromListing(
                packListings[tokenId].id,
                1
            );
        } else {
            throw new Error("No valid listing found");
        }

        return txResult;
    };

    const mediaStyle = {
        maxHeight: '300px',
        width: '100%',
        objectFit: 'contain' as 'contain',
        borderRadius: '8px'
    };

    return (
        <div className={styles.packCard}>
            {!loadingNFT && !loadingPackListings ? (
                <div className={styles.shopPack}>
                    <div>
                        {packNFT?.metadata && (
                            <ThirdwebNftMedia
                                metadata={packNFT.metadata}
                                style={mediaStyle}
                            />
                        )}
                    </div>
                    <div className={styles.packInfo}>
                        <h3>{packNFT?.metadata.name}</h3>
                        {packListings?.[tokenId] ? (
                            <>
                                <p>Cost: {packListings[tokenId].currencyValuePerToken.displayValue} {` ` + packListings[tokenId].currencyValuePerToken.symbol}</p>
                                <p>Supply: {packListings[tokenId].quantity}</p>
                                {!address ? (
                                    <p>Login to buy</p>
                                ) : (
                                    <Web3Button
                                        contractAddress={MARKETPLACE_ADDRESS}
                                        action={() => buyPack()}
                                    >Buy Pack</Web3Button>
                                )}
                            </>
                        ) : (
                            <p>No active listings found</p>
                        )}
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};
