import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import undraw_portfolio_update from '@site/static/img/undraw_portfolio_update.svg';
import undraw_note_list from '@site/static/img/undraw_note_list.svg';
import undraw_product_iteration from '@site/static/img/undraw_product_iteration.svg';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    Svg: undraw_portfolio_update,
    description: (
      <>
        Rster is designed to help you declaring your api structure in a simple
        way. Just tell the framework how you want your api to be structured and
        it will do the rest.
      </>
    ),
  },
  {
    title: 'Focus on What Matters',
    Svg: undraw_note_list,
    description: (
      <>
        Rster lets you focus on your api structure, and we&apos;ll do the communication 
        between your api and your client. Rster Is completely able to generate an api 
        client to communicate with your api and to use in your frontend.
      </>
    ),
  },
  {
    title: 'Flexible',
    Svg: undraw_product_iteration,
    description: (
      <>
        Extend or customize your website layout by reusing React. Docusaurus can
        be extended while reusing the same header and footer.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
