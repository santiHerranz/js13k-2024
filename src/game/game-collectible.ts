import { COIN_TYPE, Coin, COIN_YELLOW, COIN_COLLECTED, COIN_RED, COIN_TOUCHED } from "./game-coin";
import { Bomb } from "./game.bomb";
import { UnitProperties } from "./unit";


export class CollectibleFactory {

  static createCollectible(type: COIN_TYPE, props: UnitProperties): Coin {

    console.log(`create ${type}`);

    switch (type) {
      case COIN_YELLOW:
      case COIN_TOUCHED:
      case COIN_COLLECTED:
      case COIN_RED:
        let coin = new Coin(type, props);

        switch (type) {
          case COIN_YELLOW: coin.color = 'yellow'; break;
          case COIN_TOUCHED: coin.color = 'yellow'; break;
          case COIN_COLLECTED: coin.color = 'yellow'; break;
          case COIN_RED: coin.color = 'yellow'; break;
        }
        return coin;

      // Agrega más tipos según sea necesario
      default:
        throw new Error(`Unknown collectible type: ${type}`);
    }

  }
}
