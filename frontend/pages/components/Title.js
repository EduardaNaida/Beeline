import { makeStyles } from "@material-ui/core";



const useStyles = makeStyles((theme) => ({
  text: {
    fontSize: '150px',
    fontFamily: "cursive",
    [theme.breakpoints.down('md')]: {
      marginBottom: '125px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      //marginBottom: '125px',
    },
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '120px',
      marginTop: '-20px',
    },
  }
}));
/**
 * Displays the name of our application Beeline
 * @returns The name of our application
 */
function Title() {
  const classes = useStyles();

  return (
      <h1 className={classes.text}>BeeLine</h1>
  );
};

export default Title;

