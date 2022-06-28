import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import CaptchaTest from '../captcha_test';
import CaptchaTestCheckout from '../CaptchaTestCheckout';
import React, { useEffect, useState } from 'react';
import axios from 'axios';



/**
 * Displays a captcha to determine whether or not the user is human.  
 * @returns the page for the capatcha.
 */

function CaptchaPage(){
    const { id } = useParams();

    const [data, setData] = useState([]);
    const [sensor, setSensor] = useState(0);

    /*************  stores get *************/
    useEffect(() => {
        axios.get('/API/v1/stores/0')
            .then((response) => {
                response.data.filter((store) => {
                    if (store.ID === id){
                        setData(store);
                    }
                })
            })
    }, []);

    /*************  sensor get *************/
    useEffect(() => {
        axios.get('/API/v1/sensor/'+id)
        .then((response) => {
            setSensor(response.data.Value);
        })
    }, []);

    const renderCaptcha = () => {
        if (sensor == data.Max) {
            return <CaptchaTest id = {id} store={data}/>;
        } else{
            return <CaptchaTestCheckout id = {id} checkout={data}/>;
        }
    }

    return(
        <div>

            <Link to={`/`}>
                <div>
                    <p className="return"></p>
                </div>
            </Link>

            <div>
            {renderCaptcha()}
            </div>
        </div>
    );
}

export default CaptchaPage;