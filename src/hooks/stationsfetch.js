import axios from 'axios';

useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/');
        // Assuming your data is an array of station objects
        setStations(response.data);
      } catch (error) {
        console.error('Error fetching station data:', error);
      }
    };
  
    fetchStations();
  }, []);
  
