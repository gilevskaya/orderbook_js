import React from "react";

import styles from "./OrderBook.module.scss";

// ACTIONS
// "partial": {symbol: "XBTUSD", id: 8700000000, side: "Sell", size: 20001, price: 1000000}
// "update": {symbol: "XBTUSD", id: 8799108400, side: "Buy", size: 34755}
// "insert": {symbol: "XBTUSD", id: 8798520600, side: "Sell", size: 29, price: 14794}
// "delete": {symbol: "XBTUSD", id: 8799087650, side: "Sell"}

export const OrderBook = () => {
  const [bids, setBids] = React.useState();
  const [asks, setAsks] = React.useState();
  const [totalBidsAsks, setTotalBidsAsks] = React.useState();

  React.useEffect(() => {
    const socket = new WebSocket(
      "wss://www.bitmex.com/realtime?subscribe=orderBookL2_25:XBTUSD"
    );
    socket.addEventListener("message", event => {
      const data = JSON.parse(event.data);

      if (!bids && !asks && data.action === "partial") {
        const bidsData = data.data
          .filter(e => e.side === "Sell")
          .sort((e1, e2) => e2.price - e1.price);
        let currTotalBids = 0;
        for (const bidsInd in bidsData) {
          currTotalBids += bidsData[bidsData.length - 1 - bidsInd].size;
          bidsData[bidsData.length - 1 - bidsInd].total = currTotalBids;
        }
        setBids(bidsData);

        const asksData = data.data
          .filter(e => e.side === "Buy")
          .sort((e1, e2) => e2.price - e1.price);
        let currTotalAsks = 0;
        for (const askInd in asksData) {
          currTotalAsks += asksData[askInd].size;
          asksData[askInd].total = currTotalAsks;
        }
        setAsks(asksData);

        setTotalBidsAsks(currTotalBids + currTotalAsks);
      }
    });
  }, []);

  if (!bids || !asks) return <div>Loading...</div>;

  return (
    <div style={{ textAlign: "right" }}>
      <div
        className={styles.table}
        style={{
          display: "grid",
          gridTemplateColumns: "120px 120px 120px",
          marginBottom: "20px"
        }}
      >
        {bids &&
          bids.map(({ size, price, total }) => (
            <React.Fragment key={price}>
              <div style={{ color: "red" }}>{price.toFixed(1)}</div>
              <div>{formatNumber(size)}</div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    zIndex: -10,
                    opacity: 0.3,
                    background: "red",
                    width: `${(total / totalBidsAsks) * 100}%`
                  }}
                >
                  &nbsp;
                </div>
                <div style={{ position: "relative" }}>
                  {formatNumber(total)}
                </div>
              </div>
            </React.Fragment>
          ))}
      </div>
      <div
        className={styles.table}
        style={{
          display: "grid",
          gridTemplateColumns: "120px 120px 120px"
        }}
      >
        {asks &&
          asks.map(({ size, price, total }) => (
            <React.Fragment key={price}>
              <div style={{ color: "green" }}>{price.toFixed(1)}</div>
              <div>{formatNumber(size)}</div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    zIndex: -10,
                    opacity: 0.3,
                    background: "green",
                    width: `${(total / totalBidsAsks) * 100}%`
                  }}
                >
                  &nbsp;
                </div>
                <div style={{ position: "relative" }}>
                  {formatNumber(total)}
                </div>
              </div>
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
