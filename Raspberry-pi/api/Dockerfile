FROM python:3.10

###################### Add dependencies for different DB conectors if needed ######################
RUN apt-get update && \ 
    apt-get install -y curl && \
    apt-get install python3-pip && \
    pip3 install --upgrade setuptools && \
    pip3 install --upgrade adafruit-circuitpython-dht && \
    pip3 install --upgrade adafruit-circuitpython-mcp3xxx && \
    curl -sSL https://install.python-poetry.org | python3 - --version "$APP_POETRY_VERSION" 

###################### Add local path ###################### 
ENV PATH=/root/.local/bin:$PATH

###################### Set workdir in docker container and copy files over ###################### 
WORKDIR /api
COPY pyproject.toml ./

###################### Configure poetry and install desired packages ######################
RUN poetry config virtualenvs.in-project true --local && poetry install --only main

###################### Copy python files over ######################
COPY . /api