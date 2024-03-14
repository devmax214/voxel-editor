'use client'

import React from 'react';
import { Button } from '@chakra-ui/react';

const ErrorPage = () => {
  return (
    <div
      className={
        'm-auto flex min-h-[50vh] w-full items-center justify-center'
      }
    >
      <div className={'flex flex-col space-y-8'}>
        <div
          className={
            'flex space-x-8 divide-x divide-gray-100' +
            ' dark:divide-dark-700'
          }
        >
          <div>
            <div className='font-heading scroll-m-20 text-4xl font-bold tracking-tight'>
              <span className={'text-primary'}>500</span>
            </div>
          </div>

          <div className={'flex flex-col space-y-4 pl-8'}>
            <div className={'flex flex-col space-y-2'}>
              <div>
                <div className='font-heading scroll-m-20 text-4xl font-bold tracking-tight'>
                  Error
                </div>
              </div>

              <p className={'text-gray-500 dark:text-gray-300'}>
                Something went wrong
              </p>
            </div>

            <div className={'flex space-x-4'}>
              <Button variant={'outline'}>
                Back to main page
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage;
