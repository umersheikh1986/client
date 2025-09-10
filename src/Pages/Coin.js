import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import Chart from "../Components/Chart";
import PriceAlert from "../Components/PriceAlert";
import { $numberWithCommas, $currencySymbol, returnMultiple } from '../Utils/Helpers';
import {translationStrings} from '../Utils/i18n';

class Coin extends Component {
  render() {
    const string = translationStrings(this.props.language);
    // https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/scroll-restoration.md
    window.scrollTo(0, 0);


    // wait for market data before trying to render single coin
    if (!this.props.marketData) {
      return null;
    }

    const curSymbol = $currencySymbol(this.props.currency);
    const home = this.props.blockstack ? '/blockstack' : '/';
    const coin = this.props.match.params["0"] || 'X';
    const coinz = Object.keys(this.props.coinz).length > 0 ? this.props.coinz : false;
    const coinInfo = coinz && coin ? coinz[coin] : false;
    const exchangeRate = this.props.exchangeRate;
    const marketData = this.props.marketData ? this.props.marketData : false;
    const price = marketData[coin] && marketData[coin].ticker
      ? Number(marketData[coin].ticker.price) * exchangeRate
      : 0; //false

    const hodl = coinInfo && Number(coinInfo.hodl);
    const cost_basis = coinInfo && Number(coinInfo.cost_basis);
    const totalCostBasis = cost_basis * hodl;
    const currentValue = hodl * price;


    const volume24 = Boolean(marketData[coin] && marketData[coin].ticker) && marketData[coin].ticker.volume * price;
    // console.log(marketData[coin].ticker.volume, 'voluem?');

    const chartColor = !price || price >= cost_basis
      ? '#21ce99'
      : '#d82d2d';
    const headStyle = {
      backgroundColor: chartColor,
    };

    const changellyCoins = [
      'BTC',
      'ETH',
      'XMR',
      'ZEC',
      'DASH',
      'XRP',
      'LTC',
      'DOGE',
      'BCH',
      'BTG',
      'DGB',
      'EXP',
      'GAME',
      'LSK',
      'NLG',
      'NXT',
      'POT',
      'QTUM',
      'SYS',
      'XDN',
      'XVG'
    ];

    const changePrefix = "https://changelly.com/widget/v1?auth=email&";
    const changeSuffix = "&merchant_id=db206cefa712&address=&amount=1&ref_id=db206cefa712&color=" + chartColor.replace("#", "");

    const changellyBuy = changePrefix + "from=BTC&to=" + coin.toUpperCase() + changeSuffix;
    const changellySell = changePrefix + "from=" + coin.toUpperCase() + "&to=BTC" + changeSuffix;

    return (
      <div className="Coin">
        <Link className="menu" key='Menu' to='/menu'><i className="btn-menu fa fa-lg fa-bars" aria-hidden="true"></i></Link>
        <Link className="coinClose" to={home}><i className="btn-menu fa fa-lg fa-times" aria-hidden="true"></i></Link>

        <div className="coinCard">
          <h2>{coin.toUpperCase()}</h2>
          <h1>{curSymbol}{$numberWithCommas(price.toFixed(2))}</h1>
          <p>{returnMultiple(currentValue, totalCostBasis).toFixed(2)}x</p>

          <div className="theChart">
            <Chart chartColor={chartColor} exchangeRate={this.props.exchangeRate} ticker={coin} />
          </div>

          {changellyCoins.includes(coin.toUpperCase()) &&
          <div className="listCoin">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={changellyBuy}>
              <button className="btn-buy" style={headStyle}>
                <i className="fa fa-money" aria-hidden="true"></i> Buy
              </button>
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={changellySell}>
              <button className="btn-buy" style={headStyle}>
                <i className="fa fa-line-chart" aria-hidden="true"></i> Sell
              </button>
            </a>

          </div>}

          {!changellyCoins.includes(coin.toUpperCase()) &&
          <div className="listCoin">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={"https://changelly.com/widget/v1?auth=email&from=ETH&to=BTC&merchant_id=db206cefa712&address=&amount=1&ref_id=db206cefa712&color=" + chartColor.replace("#", "")}>
              <button className="btn-buy" style={headStyle}>
                <i className="fa fa-line-chart" aria-hidden="true"></i> Trade Coins
              </button>
            </a>
          </div>}

          <div className="listCoin">
            <span className="left">
              {hodl}<br/>
              <span className="lightGray">{coin.toUpperCase() + " Holding"}</span>
            </span>
            <span className="right">
              {curSymbol}{$numberWithCommas( (currentValue).toFixed(2) )}<br/>
              <span className="lightGray">{string.total+curSymbol+string.holding}</span>
            </span>
          </div>

          <div className="listCoin">
            <span className="left">
              {curSymbol}{volume24 && $numberWithCommas(volume24.toFixed())}<br/>
              <span className="lightGray">{string.volume}</span>
            </span>
            <span className="right">
              {curSymbol}{$numberWithCommas((totalCostBasis).toFixed(2))}&nbsp;<span className="lightGray">({$numberWithCommas(cost_basis.toFixed(2))})</span><br/>
              <span className="lightGray">{string.costbasis}</span>
            </span>
          </div>

          <div style={{ margin: '20px 0' }}>
            <PriceAlert
              coinz={{ [coin]: coinInfo }}
              marketData={this.props.marketData}
              currency={this.props.currency}
              saveNewPref={this.props.saveNewPref}
            />
          </div>

          <div className="trash listCoin">
            <span className="left">
            </span>
            <span className="right">
              <span onClick={()=>this.props.deleteCoin(coin, this.props.history)} className="lightGray"><i className="fa fa-trash" aria-hidden="true"></i></span>
            </span>
          </div>

        </div>
      </div>
    );
  }
}

export default Coin;
