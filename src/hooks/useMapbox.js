import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'aqui el token';

export const useMapbox = (puntoInicial) => {
  
    //referencia al Div del Mapa
    const mapaDiv = useRef()
    const setRef = useCallback( (node) => {
        mapaDiv.current = node;
    },[]);

    //referencia a los marcadores
    const marcadores = useRef({});

    // Observables Rxjs
    const movimientoMarcador = useRef(new Subject());
    const nuevoMarcador = useRef(new Subject());

    //Mapa y Coords
    const mapa = useRef();
    const [coords, setCoords] = useState(puntoInicial);
    
    // funcion para agregar marcador
    const agregarMarcador = useCallback((ev, id)=> {
      const { lng, lat } = ev.lngLat || ev;
      const marker = new mapboxgl.Marker();
      marker.id = id ??  v4();
      marker
        .setLngLat([lng, lat])
        .addTo(mapa.current)
        .setDraggable(true);
      
      //asignamos al objeto de marcadores
      marcadores.current[marker.id]= marker;

      //Si el marcador tiene id no emitir
      if(!id){
        nuevoMarcador.current.next({
          id: marker.id,
          lng, 
          lat
        });
      }

      // escuchar movimiento del marcador
      marker.on('drag', ({target})=>{
        const {id} = target;
        const {lng, lat} = target.getLngLat();
        //console.log(lng, lat);
        // emitir los cambios del marcador
        movimientoMarcador.current.next({id, lng, lat});
      })

    }, []);

    //funcion para actualizar Ubicacion marcador

    const actualizarPosicion = useCallback(
      ({id, lng, lat}) => {
        marcadores.current[id].setLngLat([lng, lat])
      },
      [])
    

    useEffect(() => {
      const map = new mapboxgl.Map({
        container: mapaDiv.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [puntoInicial.lng, puntoInicial.lat],
        zoom: puntoInicial.zoom
      });
      mapa.current = map;
    }, [puntoInicial])
  
    useEffect(() => {
      mapa.current?.on('move', () => {
          const {lng, lat} = mapa.current.getCenter();
          setCoords({
            lng: lng.toFixed(4),
            lat: lat.toFixed(4),
            zoom: mapa.current.getZoom().toFixed(2)
          })
      });
      //return mapa?.off('move');
    }, [])
    
    // agregar marcadores con click
    useEffect(() => {
      mapa.current?.on('click', agregarMarcador);
    }, [agregarMarcador])
    
  
    return {
        agregarMarcador,
        actualizarPosicion,
        coords,
        marcadores,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$ : movimientoMarcador.current,
        setRef
  }
}
