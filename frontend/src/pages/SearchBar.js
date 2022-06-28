import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    searchIcon2: {
        '& svg': {
          fontSize: 95
        },
        
      /*  [theme.breakpoints.down('md')]: {
          marginBottom: '3%', 
          marginRight: '0%',
        },
        [theme.breakpoints.up('lg')]: {
         marginBottom: '1%', 
        marginTop: '1%', 
        marginRight: '0%', 
        }*/
      },
      paper: {
        [theme.breakpoints.down('md')]: {
          minWidth: 'fit-content',
          margin: 'auto',
          marginBottom: '80px',
          borderRadius: '100px',
          marginLeft: '0%',
          marginRight: '0%',
        },
        [theme.breakpoints.up('lg')]: {
          boxShadow: 'none',
          textAlign: 'center',
          //marginLeft: '27%',
          //marginRight: '27%',
          margin: 'auto', 
          maxWidth: '800px', 
          minWidth: '800px', 
          borderRadius: '100px',
        }
      },
      input: {
        [theme.breakpoints.down('md')]: {
          fontSize: '65px', 
          padding: '30px', 
          marginLeft: '2%',
          width: '74vw',
          //height: '100px',
        },
        [theme.breakpoints.up('lg')]: {
          fontSize: '40px', 
          padding: '10px', 
          marginLeft: '2%',
         
        },
      }
}));


function SearchBar(props) {
    const classes = useStyles();
    /*<Paper className={classes.paper} component="form" elevation={24} id="paper">*/
  return (
    
    <Paper component="form" elevation={24} className={classes.paper} >
      <InputBase
      //id="searchField"
      className={classes.input}
      placeholder="Search..."
      //style = {{fontSize: '65px', padding: '30px', marginLeft: '2%'}}
      inputProps={{ 'aria-label': 'search google maps' }}
      onChange={props.onChange}
      />
      <IconButton 
      className={classes.searchIcon2}
      aria-label="search"
      style={{marginBottom: '3%', marginRight: '0%'}}>
      <SearchIcon />
      </IconButton>
    </Paper >
  );
}

export default SearchBar;
