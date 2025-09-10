import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AddCoin from '../Components/AddCoin';
import CurrencyPref from '../Components/CurrencyPref';
import LanguagePref from '../Components/LanguagePref'
import ImportExport from '../Components/ImportExport';
import {translationStrings} from '../Utils/i18n';


class Menu extends Component {
  render() {
    const home = this.props.blockstack ? '/blockstack' : '/';
    const currency = this.props.pref.currency ? this.props.pref.currency : '...';
    const language = this.props.pref.language ? this.props.pref.language : null;
    const string = translationStrings(this.props.language);

    return (
      <div className="theMenu">
        <Link className="menu" key='nav' to={home}>
          <i className="btn-menu fa fa-lg fa-times" aria-hidden="true"></i>
        </Link>
        <CurrencyPref
          supportedCurrencies={this.props.supportedCurrencies}
          saveNewPref={this.props.saveNewPref}
          language={language}
          currency={currency}
          key="CurrencyPref" />
        <LanguagePref
          saveNewPref={this.props.saveNewPref}
          language={language}
          key="LanguagePref" />
          
        <AddCoin
          language={language}
          addCoinz={this.props.addCoinz} 
          key='AddCoin'
        />

        <ImportExport language={language}/>

        <div className="menu-section" style={{
          margin: '20px 0',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(33, 206, 153, 0.1), rgba(108, 92, 231, 0.1))',
          borderRadius: '16px',
          border: '1px solid rgba(33, 206, 153, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <Link to="/analytics" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #21ce99, #00d4aa)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(33, 206, 153, 0.4)'
          }} 
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.02)';
            e.target.style.boxShadow = '0 12px 32px rgba(33, 206, 153, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 8px 24px rgba(33, 206, 153, 0.4)';
          }}>
            <i className="fa fa-chart-line" style={{
              fontSize: '20px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }} aria-hidden="true"></i>
            <span>📊 Portfolio Analytics</span>
          </Link>
        </div>

        <div>
          <hr/>
          <p className="center">
            <b>Leverage your hodlings with a <a href="https://rocko.co"><i>crypto backed loan</i></a> through Rocko DeFi!</b>
          </p>
        </div>

        <div>
          <hr/>
          <p className="center">
            <a href="https://github.com/vinniejames/coinfox">{string.learnmore}</a> or&nbsp;
            <a href="https://github.com/vinniejames/coinfox/issues">{string.givefeedback}</a>
          </p>
        </div>

      </div>
    );
  }
}

export default Menu;
