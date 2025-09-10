import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { isUserSignedIn } from 'blockstack';

import Pie from './Pie';
import TotalPortfolio from '../Components/TotalPortfolio';
import PortfolioSummary from '../Components/PortfolioSummary';
import SearchFilter from '../Components/SearchFilter';
import CoinList from '../Components/CoinList';
import CurrencyPref from '../Components/CurrencyPref';
import AddCoin from '../Components/AddCoin';
import {translationStrings} from '../Utils/i18n';


class Home extends Component {

  constructor () {
    super()
    this.state = {
      listView: true,
      searchTerm: '',
      activeFilter: 'all',
      sortBy: 'value'
    }
  }

  componentDidMount () {
    // if (window.location.search.indexOf("blockstring")) {
    //   console.log('adjusting redirect in HOMEx');
    //   var redirectPath = localStorage.getItem("blockstring");
    //   // window.history.replaceState(null, null, redirectPath);
    //   this.props.history.push(redirectPath);
    //   localStorage.removeItem('blockstring');
    // }
  }

  toggleView = () => {
    this.setState({listView: !this.state.listView});
  }

  handleSearch = (searchTerm) => {
    this.setState({ searchTerm });
  }

  handleFilter = (filter) => {
    this.setState({ activeFilter: filter });
  }

  handleSort = (sortBy) => {
    this.setState({ sortBy });
  }
  render() {
    const coinz = Object.keys(this.props.coinz).length > 0 ? this.props.coinz : false;
    const string = translationStrings(this.props.language);
    if (coinz) {
      return (
        <div className="Home">
          <div className="header" style={{ position: 'relative' }}>
            <Link className="menu" key='Menu' to='/menu'>
              <i className="btn-menu fa fa-lg fa-bars" aria-hidden="true"></i>
            </Link>
            <Link to="/analytics" style={{ position: 'absolute', right: '20px', top: '20px', color: '#21ce99', fontSize: '18px', textDecoration: 'none' }}>
              <i className="fa fa-chart-line" aria-hidden="true"></i>
            </Link>
            <TotalPortfolio
              totalPortfolio={this.props.totalPortfolio}
              currency={this.props.currency}
              exchangeRate={this.props.exchangeRate}
              marketData={this.props.marketData}
              coinz={this.props.coinz}
              key={"TotalPortfolio"}/>
          </div>
          
          <PortfolioSummary
            totalPortfolio={this.props.totalPortfolio}
            marketData={this.props.marketData}
            coinz={this.props.coinz}
            currency={this.props.currency}
            exchangeRate={this.props.exchangeRate}
          />
          
          <SearchFilter
            onSearch={this.handleSearch}
            onFilter={this.handleFilter}
            onSort={this.handleSort}
            searchTerm={this.state.searchTerm}
            activeFilter={this.state.activeFilter}
            sortBy={this.state.sortBy}
          />
          <div className="toggleView">
            <i onClick={this.toggleView} className={this.state.listView ? "fa fa-lg fa-pie-chart" : "fa fa-lg fa-th-list"} aria-hidden="true"></i>
          </div>
          {!this.state.listView && <Pie
              coinz={this.props.coinz}
              marketData={this.props.marketData}
              exchangeRate={this.props.exchangeRate}
              totalPortfolio={this.props.totalPortfolio}
          />}
          {this.state.listView && <CoinList
            currency={this.props.currency}
            exchangeRate={this.props.exchangeRate}
            marketData={this.props.marketData}
            coinz={this.props.coinz}
            searchTerm={this.state.searchTerm}
            activeFilter={this.state.activeFilter}
            sortBy={this.state.sortBy}
            key={"CoinList"}/>}
        </div>
      );
    } else { // if (!isUserSignedIn()) {
      console.log("!isUserSignedIn()");
      // NEW User Welcome screen
      return (
        <div className="Home">
          <div className="header">
            <Link className="menu" key='Menu' to='/menu'>
              <i className="btn-menu fa fa-lg fa-bars" aria-hidden="true"></i>
            </Link>
            <h1 className="center">{string.welcome}</h1>
            <p className="center">{string.tag}</p>
          </div>
          <div className="addFirstCoin">
            <CurrencyPref
              supportedCurrencies={this.props.supportedCurrencies}
              saveNewPref={this.props.saveNewPref}
              language={this.props.language}
              currency={this.props.currency} 
            />
            <AddCoin 
              addCoinz={this.props.addCoinz}
              language={this.props.language}
              key='AddCoin'
            />
          </div>

        </div>
      );
    } //else {
      //return null // @TODO add loading screen
    //}
  }
}

export default Home;
