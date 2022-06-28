import StoreRow from "./StoreRow";
/**
 * Receives the stores and maps them to seperate rows
 * @param filteredStores The all the stores that are filtered when searching for a store, default is all stores
 * @returns A div containing a list of the stores
 */
function StoreTableMyTickets({filteredStores, link, linktwo}){
    /*const list = [];
    for(let x of filteredStores){
            list.push(x[0])
    }*/
    console.log("INMYTICKETTABLE "+JSON.stringify(filteredStores))
  const storelist = filteredStores.map(store => <StoreRow store={store} link={link} linktwo={linktwo} from={false} />);
  return <div>{storelist}</div>
}

export default StoreTableMyTickets;