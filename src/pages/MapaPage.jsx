import React, { useEffect, useRef, useState } from 'react';
import { useMapbox } from "../hooks/useMapbox";
import { useContext } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from '../context/SocketContext';

const puntoInicial = {
  lng: -122.472,
  lat: 37.801,
  zoom: 13.5
}

export const MapaPage = () => {

  const  { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox(puntoInicial);

  const {socket} = useContext(SocketContext);
  
  //Escuchar Marcadores Existentes

  useEffect(() => {
    socket.on('marcadores-activos', (marcadores)=>{
      for(const key of Object.keys(marcadores)){
        agregarMarcador(marcadores[key], key);
      }
    });
  }, [socket, agregarMarcador]);
  

  //Nuevo Marcador
  useEffect(() => {
    nuevoMarcador$.subscribe(marcador => {
      socket.emit('marcador-nuevo', marcador);
    })
  }, [nuevoMarcador$, socket])
  
  // Movimiento de marcador 
  useEffect(() => {
    movimientoMarcador$.subscribe(marcador =>{
      socket.emit('marcador-actualizado', marcador);
    })
  }, [socket,movimientoMarcador$])
  
  //Mover Marcador Mediante Sockets
  useEffect(() => {
    socket.on('marcador-actualizado', (marcador)=>{
      actualizarPosicion(marcador)
    })
  }, [socket, actualizarPosicion])
  

  //Escuchar nuevos
  useEffect(() => {
    socket.on('marcador-nuevo', (marcador)=>{
      agregarMarcador(marcador, marcador.id)
    })
  }, [socket, agregarMarcador])
  

  return (
    <>
    <div className='info'> Lng: { coords.lng } | Lat: { coords.lat } | Zoom: { coords.zoom } </div>
    <div 
      ref={setRef}
      className='mapContainer'/>
    </>
  )
}
