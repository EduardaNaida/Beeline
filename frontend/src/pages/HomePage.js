import { useEffect, useState} from 'react';
import Title from "./components/Title.js";
import StoreTable from "./components/StoreTable.js";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, Button } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import axios from 'axios';
import SearchBar from "./SearchBar.js";
import { Link } from "react-router-dom";
import BeeLogo from "./components/BeeLogo.js";
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import bee from './media/bee.png';

const useStyles = makeStyles((theme) => ({
    ticketIcon: {
        '& svg': {
          fontSize: 95
          //color: "#ffffff"
        }
      },
      nearby: {
        [theme.breakpoints.down('md')]: {
          fontSize: '80px', 
          marginLeft: '5%',
        },
        [theme.breakpoints.up('lg')]: {
          fontSize: '40px', 
          marginLeft: '30%',
        },
      },
      beeLogo: {
        height: '100px', 
        width: '140px', 
        [theme.breakpoints.down('md')]: {
          marginLeft: '490px',
          marginBottom: '-265px', 
          transform: 'rotate(-25deg)'
        },
        [theme.breakpoints.up('lg')]: {
          marginLeft: '50%',
          marginBottom: '-5%', 
          transform: 'rotate(-25deg)'
        },
      }, 
      beeLogo2: {
        height: '60px', 
        width: '90px',
        [theme.breakpoints.down('md')]: {
          marginLeft: '750px', 
          marginBottom: '-210px', 
          transform: 'rotate(-25deg)'
        },
        [theme.breakpoints.up('lg')]: {
          marginLeft: '-2%', 
          marginBottom: '-8%', 
          transform: 'rotate(-25deg)'
        }
      },
      beeLogo3: {
        height: '40px', 
        width: '60px', 
        [theme.breakpoints.down('md')]: {
          marginLeft: '810px', 
          marginBottom: '-220px', 
          transform: 'rotate(-25deg)'
        },
        [theme.breakpoints.up('lg')]: {
          marginLeft: '-1%', 
          marginBottom: '-10%', 
          transform: 'rotate(-25deg)'
        }
        
      },

}));


/**
 * filters out stores depending on the search query.
 * @param listOfStores the stores that you can search
 * @param query the message that is put in the searchbar
 * @returns list of stores that match the search or if no message is put into the sarchbar returns the default list of stores.
 */
 const filterStores = (listOfStores, query) => {
  if (!query) {
      return listOfStores;
  }

  return listOfStores.filter((store) => {
      const name = store.Name;
      const lengthOfQuery = query.length; 
      const shortName = name.slice(0, lengthOfQuery);

      if (query.toLowerCase() === shortName.toLowerCase()){
        return true;
      }
      else{
        return false;
      }
  });
};


/**
 * 
 * @returns displays the homepage with logo, searchbar and a table of stores
 */

const HomePage = () => {
    const [searchQuery, setSearchQuery]  = useState('');
    const [data, setData] = useState([]);
  


    useEffect(() => {
        axios.get('/API/v1/stores/0')
          .then((response) => {
            setData(response.data);
      })
    }, [searchQuery]);


    const filteredStores = data.length === 0 ? [] : filterStores(data, searchQuery); //window.listOfStores
  
    const handleSubmit = (event) => {
      event.preventDefault();
      console.log(event.target.searchStore.value);
    };
  
    const handleChange = (event) => {
      setSearchQuery(event.target.value);
    };
  
    const classes = useStyles();


    const renderLogo = () => {
      return (<img className={classes.beeLogo}
                   src={bee}/>);
    }
    const renderLogo2 = () => {
      return (<img className={classes.beeLogo2} src={bee}/>);
    }

    const renderLogo3 = () => {
      return (<img className={classes.beeLogo3}src={bee}/>);
    }

    return( 
    <div>
      <Button
      className={classes.ticketIcon}
      variant="contained"
      component={Link} to={`/yourtickets`}
      style={{backgroundColor: '#f0ffff', fontSize: '40px', marginTop: '45px', marginLeft: '35px'}}>
     
      <ConfirmationNumberIcon size='large'/>

      </Button>
    {renderLogo()}
    {renderLogo2()}
    {renderLogo3()}
      {/*<BeeLogo/>*/}
      <Title/> 
      <SearchBar
      onChange={handleChange}/>
      <div className={classes.nearby}>
        Nearby
      </div>
      <StoreTable filteredStores={filteredStores} link="/store" linktwo="/checkout"/>   
    </div>
    
    );
  }
  
  export default HomePage;
