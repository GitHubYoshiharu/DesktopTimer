import React from 'react';
import { useState, useEffect } from "react";
import './App.scss';

export default function App() {
    const [timerSeconds, setTimerSeconds] = useState<number>(0); // この値が変更されると、自動でレンダリングされる

    const [inputSeconds, setInputSeconds] = useState<number>(0);
    const addInputSeconds = (seconds: number) => {
      if(inputSeconds + seconds > 99*60 + 59){
        setInputSeconds(99*60 + 59);
      } else {
        setInputSeconds(inputSeconds + seconds);
      }
    };

    /* timerState:
     * 'input' ... タイマーの時間設定を受け付ける状態
     * 'start' ... タイマーをスタートする状態
     * 'running' ... タイマーがスタートしている状態
     * 'pause' ... タイマーが一時停止している状態
     * 'stop' ... 設定した時間が経過し、タイマーが止まっている状態
     */
    const [timerState, setTimerState] = useState<string>('input');

    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    // 依存配列（第2引数）内の状態変数の値が更新されたら呼び出される
    useEffect(() => {
      switch(timerState){
        case 'start':
          let id = setInterval(() => {
            // ???: 依存配列に入れてるから引数に更新関数を指定しなくても値を更新できるはずだが、できない。
            setTimerSeconds(timerSeconds => timerSeconds - 1);
          }, 1000);
          setIntervalId(id);
          setTimerState('running');
          break;
        case 'running':
          if(timerSeconds === 0){
            clearInterval(intervalId as NodeJS.Timeout);
            setTimerState('stop');
          }
          break;
        case 'pause':
          clearInterval(intervalId as NodeJS.Timeout);
          break;
      }
    }, [timerState, timerSeconds]);

    const timerString = (minutes: number, seconds: number): string => {
      return (minutes > 99 ? 99 : minutes).toString().padStart(2, '0')
        + ':' + (minutes > 99 ? 59 : seconds).toString().padStart(2, '0');
    };

    const handleStart = () => {
      if(inputSeconds === 0) return;
      if(timerState === 'input'){
        setTimerSeconds(inputSeconds);
      }
      setTimerState('start');
    };

    const handlePause = () => {
      setTimerState('pause');
    };

    const handleRewind = () => {
      if(timerState === 'running'){ 
        clearInterval(intervalId as NodeJS.Timeout);
      }
      setTimerSeconds(inputSeconds);
      setTimerState('input');
    };

    // ショートカットキーを実現する
    // ???: addEventListenerを使ったら重複して登録され、意図した動作にならなかった。
    // 重複して登録された原因は未だに不明。
    window.onkeydown = (e) => {
      switch(timerState){
        case 'input':
          if(e.key === ' '){
            document.getElementById('start')?.click();
          } else if(e.key === 'r'){
            document.getElementById('reset')?.click();
          }
          break;
        case 'running':
          if(e.key === ' '){
            document.getElementById('pause')?.click();
          } else if(e.key === 'r'){
            document.getElementById('rewind')?.click();
          }
          break;
        case 'pause':
          if(e.key === ' '){
            document.getElementById('start')?.click();
          } else if(e.key === 'r'){
            document.getElementById('rewind')?.click();
          }
          break;
        case 'stop':
          if(e.key === ' ' || e.key === 'r'){
            document.getElementById('rewind')?.click();
          }
          break;
      }
    };

    return (
        <div className="App">
            <section className='main'>
                <div>
                    <div className='timer'>
                        {timerState === 'input' && timerString(Math.trunc(inputSeconds/60), inputSeconds%60)}
                        {timerState !== 'input' && timerString(Math.trunc(timerSeconds/60), timerSeconds%60)}
                    </div>
                </div>
                {timerState === 'input' && 
                  <div className='timeInputButtons'>
                    <button onClick={() => addInputSeconds(10)}>+10s</button>
                    <button onClick={() => addInputSeconds(60)}>+1m</button>
                    <button onClick={() => addInputSeconds(600)}>+10m</button>
                    <button id='reset' onClick={() => setInputSeconds(0)}>Reset</button>
                  </div>
                }
                <div className="manipulationButtons">
                  {(timerState === 'input' || timerState === 'pause') && 
                    <button id='start' onClick={handleStart}>Start</button>
                  }
                  {timerState === 'running' && 
                    <button id='pause' onClick={handlePause}>Pause</button>
                  }
                  {timerState !== 'input' &&
                   <button id='rewind' onClick={handleRewind}>Rewind</button>
                  }
                </div>
            </section>
        </div>
    );
}