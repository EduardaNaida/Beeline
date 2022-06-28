import React, { Component } from 'react';
import {Redirect} from 'react-router';
import './css/index.css';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from './pages/components/react-simple-captcha';


import Container from '@material-ui/core/Container';
import Button from "@material-ui/core/Button";
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import InputBase from "@material-ui/core/InputBase";


import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';

 
const styles = theme => ({
    root: {
        flexGrow: 1,
      },
    paper: {
        padding: theme.spacing(2),
        background: 'transparent',
        boxShadow: 'none',
        textAlign: 'center',
        marginTop: '5%',
        [theme.breakpoints.down('md')]: {marginBottom: '5%'},
        [theme.breakpoints.up('lg')]: {marginBottom: '0%'}
    },
    papper: {
        padding: theme.spacing(2),
        background: '#ECEFF1',
        boxShadow: '5',
        textAlign: 'center',
      //  marginTop: '20%',
        [theme.breakpoints.down('md')]: {
            marginTop: '20%',

        },
        [theme.breakpoints.up('lg')]: {
            marginTop: '-5%',
            maxWidth: '50%',
            margin: 'auto',
            maxHeight: '750',
            
        }
    },
    title: {
        [theme.breakpoints.up('lg')]: {
            fontSize: '40px'
        }
    },
    text: {
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(2),
            background: 'transparent',
            boxShadow: 'none',
            textAlign: 'center',
            marginTop: '5%',
            marginBottom: '5%',
        },
        [theme.breakpoints.up('lg')]: {
            background: 'transparent',
            boxShadow: 'none',
            textAlign: 'center',
            marginTop: '5%'
        } 
    },
    pappper: {
        padding: theme.spacing(2),
        background: '#ffffff',
        boxShadow: '5',
        textAlign: 'center',
        marginTop: '5%',
        fontSize: '25px'
      },
    input: {
        [theme.breakpoints.down('md')]: {
            background:'#c1d8f7', 
            fontSize: 'xxx-large', 
            maxWidth: '700px', 
            maxHeight: '200px', 
            minWidth: '700px', 
            minHeight: '200px'
        },
        [theme.breakpoints.up('lg')]: {
            background:'#c1d8f7', 
            fontSize: '40px', 
            maxWidth: '80%', 
            minHeight: '200px', 
            minWidth: '90%', 
            maxHeight: '700px'
        }

    },
    button: {
        [theme.breakpoints.down('md')]: {
            margin: 'auto',
            backgroundColor: 'rgb(247,224,193)', 
            fontSize: 'xxx-large', 
            marginTop: '50px', 
            maxWidth: '700px', 
            maxHeight: '200px', 
            minWidth: '700px', 
            minHeight: '200px', 
            borderRadius: '100px'
        },
        [theme.breakpoints.up('lg')]: {
            margin: 'auto',
            backgroundColor: 'rgb(247,224,193)', 
            fontSize: '35px',
            //marginTop: '-10px',  
            maxWidth: '80%', 
            maxHeight: '150px', 
            minWidth: '50%', 
            minHeight: '100px', 
            borderRadius: '100px'
        }
    },
  });

class CaptchaTestCheckout extends Component {

    
 constructor(props){ 
     super(props);
     this.state = {redirect: false,
                   queuetoken: 0}
     this.id = props.id;
    }

   componentDidMount () {
      loadCaptchaEnginge(6); 
   };
 
   doSubmit = () => {
       let user_captcha = document.getElementById('user_captcha_input').value;
 
       if (validateCaptcha(user_captcha) === true) {
            /************* post to queue *************/
            axios.post('/API/v1/checkout/queue/'+this.props.checkout.ID)
            .then((response) => {
                const tokenCheckout = response.data.QueueToken;
                window.activeQueues.push([this.props.checkout, tokenCheckout, true])
                this.setState({redirect: true});
            })
           
           loadCaptchaEnginge(6); 
           document.getElementById('user_captcha_input').value = "";
       }
 
       else {
           alert('Captcha Does Not Match');
           document.getElementById('user_captcha_input').value = "";
       }
   };
 
   render() {

        const { classes } = this.props;

        const path = `/queuecheckout/${this.id}`;
        if(this.state.redirect === true){
            return  <Redirect push to={path}/>;
       }

       return (
        <div className={classes.root}>   
            <Grid xs={12}>
                <Paper className={classes.papper} >

                    <Grid container spacing={1} item>
                        <Grid item xs={12} >
                            <Paper className={classes.text}>
                                <Typography variant="h3" component="h2" className={classes.title}>
                                    Match the characters below to queue up
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} >
                            <Paper className={classes.pappper}><LoadCanvasTemplate /></Paper>
                        </Grid>

                        <Grid item xs={12} >
                            <Paper className={classes.paper}>
                                <InputBase
                                    id="outlined-basic"
                                    className={classes.input}
                                    variant="outlined"
                                    placeholder="Enter Captcha Value"
                                    name="user_captcha_input"
                                    id="user_captcha_input"
                                    inputProps={{ 'aria-label': 'search google maps', "autocomplete": "off"}}
                                    type="text"
                                />
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <Button
                                    variant="contained"
                                    className= {classes.button}
                                    onClick={() => this.doSubmit()}>
                                    Submit
                                </Button>
                            </Paper>
                        </Grid>
                   </Grid>
                </Paper>
            </Grid>
        </div>
       )};
}
 
export default withStyles(styles, { withTheme: false })(CaptchaTestCheckout);